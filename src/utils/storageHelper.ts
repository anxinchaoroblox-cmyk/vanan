// Robust storage helper using IndexedDB with fallback to localStorage
// This avoids QuotaExceededError when saving large Base64 images or MP3 audio files

import { ProfileData } from '../types';
import { DEFAULT_PROFILE } from '../data/defaultProfile';

const DB_NAME = 'VanAnBioProfileDB';
const DB_VERSION = 1;
const STORE_NAME = 'profileStore';
const PROFILE_KEY = 'current_profile';
const LOCAL_STORAGE_KEY = 'user_bio_profile';

// Open IndexedDB instance safely
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Compress image via Canvas to keep base64 compact & fast
export async function compressImage(dataUrl: string, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> {
  if (!dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      // If original was PNG with transparency, keep png if not too big, otherwise jpeg
      const isPng = dataUrl.startsWith('data:image/png');
      const format = isPng ? 'image/png' : 'image/jpeg';
      const compressed = canvas.toDataURL(format, quality);
      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Save profile reliably
export async function saveProfileToStorage(profile: ProfileData): Promise<boolean> {
  let savedSuccess = false;

  // 1. Try IndexedDB (supports large base64 avatars, backgrounds and songs without 5MB limit)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(profile, PROFILE_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    savedSuccess = true;
  } catch (err) {
    console.warn('IndexedDB save warning:', err);
  }

  // 2. Try localStorage as immediate fallback / sync
  try {
    const json = JSON.stringify(profile);
    localStorage.setItem(LOCAL_STORAGE_KEY, json);
    savedSuccess = true;
  } catch (storageErr) {
    console.warn('LocalStorage quota exceeded or unavailable. Retrying with lighter version...', storageErr);
    try {
      // If quota exceeded due to giant base64, save a sanitized version in localStorage
      const safeCopy: ProfileData = {
        ...profile,
        // If avatar or bg is > 200KB, fallback to default in localStorage while full data is safe in IndexedDB
        avatarUrl: profile.avatarUrl.length > 200000 ? DEFAULT_PROFILE.avatarUrl : profile.avatarUrl,
        backgroundUrl: profile.backgroundUrl.length > 200000 ? DEFAULT_PROFILE.backgroundUrl : profile.backgroundUrl,
        songUrl: profile.songUrl.length > 200000 ? DEFAULT_PROFILE.songUrl : profile.songUrl
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(safeCopy));
    } catch {
      // IndexedDB already saved full data
    }
  }

  return savedSuccess;
}

// Load profile reliably
export async function loadProfileFromStorage(): Promise<ProfileData | null> {
  // 1. Try IndexedDB first (holds the freshest, full-quality data)
  try {
    const db = await openDB();
    const data = await new Promise<ProfileData | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(PROFILE_KEY);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (data && typeof data === 'object' && data.name) {
      return data;
    }
  } catch (err) {
    console.warn('IndexedDB load warning:', err);
  }

  // 2. Fallback to localStorage
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.name) {
        return parsed as ProfileData;
      }
    }
  } catch (e) {
    console.warn('LocalStorage load warning:', e);
  }

  return null;
}
