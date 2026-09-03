import { ProfileData } from '../types';
import { DEFAULT_PROFILE } from '../data/defaultProfile';

// Safe base64 encoding that works with Unicode/Vietnamese
export const encodeProfileToHash = (profile: ProfileData): string => {
  try {
    const clone: ProfileData = { ...profile };

    // For web shareable URLs: exclude giant data: URLs (>5000 chars) to prevent broken URL lengths
    if (clone.avatarUrl && clone.avatarUrl.startsWith('data:') && clone.avatarUrl.length > 5000) {
      clone.avatarUrl = DEFAULT_PROFILE.avatarUrl;
    }
    if (clone.backgroundUrl && clone.backgroundUrl.startsWith('data:') && clone.backgroundUrl.length > 5000) {
      clone.backgroundUrl = DEFAULT_PROFILE.backgroundUrl;
    }
    if (clone.songUrl && clone.songUrl.startsWith('data:') && clone.songUrl.length > 5000) {
      clone.songUrl = DEFAULT_PROFILE.songUrl;
    }

    const json = JSON.stringify(clone);
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
    return encoded;
  } catch (err) {
    console.error("Failed to encode profile to hash:", err);
    return '';
  }
};

export const decodeProfileFromHash = (): ProfileData | null => {
  try {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash;
    if (!hash) return null;

    let encoded = '';
    if (hash.startsWith('#data=')) {
      encoded = hash.replace('#data=', '');
    } else if (hash.startsWith('#profile=')) {
      encoded = hash.replace('#profile=', '');
    } else {
      return null;
    }

    if (!encoded) return null;
    const json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && parsed.name) {
      return parsed as ProfileData;
    }
    return null;
  } catch (err) {
    console.warn("Could not decode profile from URL hash:", err);
    return null;
  }
};

export const getSharableUrl = (profile: ProfileData): string => {
  const hash = encodeProfileToHash(profile);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#profile=${hash}`;
};

export const downloadProfileJson = (profile: ProfileData) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  const safeName = (profile.name || 'van-an').trim().toLowerCase().replace(/\s+/g, '-');
  downloadAnchor.setAttribute("download", `ho-so-${safeName}-setup.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const parseProfileJsonFile = (file: File): Promise<ProfileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          resolve(parsed as ProfileData);
        } else {
          reject(new Error("File không đúng cấu trúc hồ sơ!"));
        }
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};
