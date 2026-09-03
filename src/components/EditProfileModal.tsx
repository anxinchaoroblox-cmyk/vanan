import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Music,
  Image as ImageIcon,
  User,
  Save,
  RotateCcw,
  Sparkles,
  FileAudio,
  Check,
  Plus,
  Trash2,
  Sliders,
  Share2,
  Volume2,
  ExternalLink,
  Layers,
  Palette,
  FileUp,
  CheckCircle
} from 'lucide-react';
import { ProfileData, SocialLink } from '../types';
import { PRESET_AVATARS, PRESET_BACKGROUNDS, PRESET_SONGS, DEFAULT_PROFILE } from '../data/defaultProfile';
import { BrandIcon, PLATFORM_OPTIONS } from './BrandIcon';
import { compressImage } from '../utils/storageHelper';
import { parseProfileJsonFile } from '../utils/shareHelper';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSave: (updatedProfile: ProfileData) => void;
  onExport?: (updatedProfile: ProfileData) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  onExport
}) => {
  const [formData, setFormData] = useState<ProfileData>({
    ...profile,
    backgroundBlur: profile.backgroundBlur ?? 3,
    backgroundBrightness: profile.backgroundBrightness ?? 80,
    defaultVolume: profile.defaultVolume ?? 0.75,
    socialLinks: profile.socialLinks ? [...profile.socialLinks] : []
  });

  const [activeTab, setActiveTab] = useState<'media' | 'audio' | 'social' | 'profile'>('media');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  // Sync formData whenever modal opens or profile prop updates
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...profile,
        backgroundBlur: profile.backgroundBlur ?? 3,
        backgroundBrightness: profile.backgroundBrightness ?? 80,
        defaultVolume: profile.defaultVolume ?? 0.75,
        socialLinks: profile.socialLinks ? [...profile.socialLinks] : []
      });
      setJustSaved(false);
    }
  }, [isOpen, profile]);

  // New social link input state
  const [newPlatform, setNewPlatform] = useState<string>('Discord');
  const [newUsername, setNewUsername] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [newColor, setNewColor] = useState<string>('#5865F2');

  if (!isOpen) return null;

  // Handle Avatar file upload with auto compression
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          try {
            const compressed = await compressImage(reader.result, 600, 600, 0.85);
            setFormData((prev) => ({ ...prev, avatarUrl: compressed }));
            setStatusMsg('Đã tải ảnh đại diện thành công & tối ưu bộ nhớ!');
          } catch {
            setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
            setStatusMsg('Đã tải ảnh đại diện lên thành công!');
          }
          setTimeout(() => setStatusMsg(''), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Background file upload with auto compression
  const handleBackgroundFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          try {
            const compressed = await compressImage(reader.result, 1400, 1400, 0.8);
            setFormData((prev) => ({ ...prev, backgroundUrl: compressed }));
            setStatusMsg('Đã tải ảnh nền không gian & tối ưu dung lượng!');
          } catch {
            setFormData((prev) => ({ ...prev, backgroundUrl: reader.result as string }));
            setStatusMsg('Đã tải ảnh nền không gian lên thành công!');
          }
          setTimeout(() => setStatusMsg(''), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Song audio file upload
  const handleSongFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({
            ...prev,
            songUrl: reader.result as string,
            songTitle: file.name.replace(/\.[^/.]+$/, ""),
            songArtist: "Tệp nhạc cá nhân"
          }));
          setStatusMsg(`Đã tải bài hát: ${file.name}`);
          setTimeout(() => setStatusMsg(''), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Song cover image upload
  const handleSongCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          try {
            const compressed = await compressImage(reader.result, 400, 400, 0.85);
            setFormData((prev) => ({ ...prev, songCover: compressed }));
          } catch {
            setFormData((prev) => ({ ...prev, songCover: reader.result as string }));
          }
          setStatusMsg('Đã cập nhật ảnh bìa bài hát!');
          setTimeout(() => setStatusMsg(''), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Import JSON file
  const handleImportJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await parseProfileJsonFile(file);
      setFormData({
        ...DEFAULT_PROFILE,
        ...imported,
        backgroundBlur: imported.backgroundBlur ?? 3,
        backgroundBrightness: imported.backgroundBrightness ?? 80,
        defaultVolume: imported.defaultVolume ?? 0.75,
        socialLinks: imported.socialLinks ? [...imported.socialLinks] : []
      });
      setStatusMsg("Đã khôi phục thành công cấu hình từ file JSON!");
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err: any) {
      setStatusMsg("Lỗi khi đọc file JSON: " + (err?.message || "File không hợp lệ"));
      setTimeout(() => setStatusMsg(''), 4000);
    } finally {
      if (jsonInputRef.current) {
        jsonInputRef.current.value = '';
      }
    }
  };

  // Add social link
  const handleAddSocialLink = () => {
    if (!newUrl.trim() || !newUsername.trim()) {
      setStatusMsg('Vui lòng nhập đầy đủ tên người dùng và đường link!');
      setTimeout(() => setStatusMsg(''), 3000);
      return;
    }

    const platformConfig = PLATFORM_OPTIONS.find(p => p.name === newPlatform);
    const newLink: SocialLink = {
      id: Date.now().toString(),
      platform: newPlatform,
      username: newUsername.trim(),
      url: newUrl.startsWith('http') ? newUrl.trim() : `https://${newUrl.trim()}`,
      color: newColor || platformConfig?.color || '#38bdf8'
    };

    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newLink]
    }));

    setNewUsername('');
    setNewUrl('');
    setStatusMsg(`Đã thêm liên kết ${newPlatform} có logo!`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  // Remove social link
  const handleRemoveSocialLink = (id: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter(item => item.id !== id)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave(formData);
      setJustSaved(true);
      setStatusMsg("✓ Đã lưu hồ sơ thành công vào bộ nhớ!");
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 500);
    } catch (e) {
      setIsSaving(false);
      setStatusMsg("Lỗi khi lưu: Hãy kiểm tra lại");
    }
  };

  const handleExportClick = () => {
    onSave(formData);
    if (onExport) {
      onExport(formData);
    }
    onClose();
  };

  const handleResetDefaults = () => {
    if (window.confirm("Bạn có chắc chắn muốn đặt lại thông tin mặc định Văn An không?")) {
      setFormData({ ...DEFAULT_PROFILE });
      onSave({ ...DEFAULT_PROFILE });
      setStatusMsg("Đã đặt lại về cấu hình chuẩn Văn An!");
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div
      id="edit-profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#111420] border border-white/15 shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display">Tùy Chỉnh Toàn Diện Hồ Sơ</h2>
              <p className="text-xs text-white/50">Avatar, Tên, Background, Nhạc & Âm lượng, Logo Mạng Xã Hội</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-all"
              title="Xuất & Chia sẻ hồ sơ"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Xuất hồ sơ</span>
            </button>
            <button
              id="btn-close-edit-modal"
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 border-b border-white/10 bg-black/25 px-4 pt-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-t-xl font-medium transition-all ${
              activeTab === 'media'
                ? 'bg-[#111420] text-cyan-400 border-t-2 border-cyan-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="truncate">1. Ảnh & Nền</span>
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-t-xl font-medium transition-all ${
              activeTab === 'audio'
                ? 'bg-[#111420] text-emerald-400 border-t-2 border-emerald-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span className="truncate">2. Nhạc & Âm lượng</span>
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-t-xl font-medium transition-all ${
              activeTab === 'social'
                ? 'bg-[#111420] text-indigo-400 border-t-2 border-indigo-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="truncate">3. Link & Logo</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-t-xl font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-[#111420] text-purple-400 border-t-2 border-purple-400'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="truncate">4. Thông tin</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {statusMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* TAB 1: MEDIA (Ảnh Avatar & Background / Backrao) */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Avatar section */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    Ảnh đại diện (Avatar của Văn An)
                  </label>
                  <span className="text-[11px] font-mono text-white/50">PNG, JPG, GIF</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 shadow-lg shrink-0 bg-black/60">
                    <img
                      src={formData.avatarUrl}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn ảnh từ máy tính / điện thoại</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFile}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Hoặc dán URL ảnh đại diện..."
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Avatar presets */}
                <div>
                  <p className="text-[11px] text-white/50 mb-1.5">Mẫu avatar có sẵn:</p>
                  <div className="flex gap-2">
                    {PRESET_AVATARS.map((av, i) => (
                      <button
                        key={i}
                        onClick={() => setFormData({ ...formData, avatarUrl: av.url })}
                        className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 hover:border-cyan-400 transition-all hover:scale-105"
                        title={av.name}
                      >
                        <img src={av.url} alt={av.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Background section (Backrao) */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    Ảnh nền không gian (Background / Backrao)
                  </label>
                  <span className="text-[11px] font-mono text-white/50">Hỗ trợ ảnh tùy chỉnh</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-white/20 shadow-md shrink-0 bg-black/60">
                    <img
                      src={formData.backgroundUrl}
                      alt="Bg Preview"
                      className="w-full h-full object-cover"
                      style={{
                        filter: `blur(${formData.backgroundBlur ?? 3}px) brightness(${((formData.backgroundBrightness ?? 80) / 100)})`
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh nền từ thiết bị</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundFile}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Hoặc dán URL ảnh nền..."
                      value={formData.backgroundUrl}
                      onChange={(e) => setFormData({ ...formData, backgroundUrl: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white focus:border-purple-400 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Backrao adjustments: Blur & Brightness */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-purple-400" />
                      Độ mờ hậu cảnh (Background Blur):
                    </span>
                    <span className="font-mono font-semibold text-purple-300">{formData.backgroundBlur ?? 3}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={formData.backgroundBlur ?? 3}
                    onChange={(e) => setFormData({ ...formData, backgroundBlur: Number(e.target.value) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-white/70 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-cyan-400" />
                      Độ sáng nền (Brightness):
                    </span>
                    <span className="font-mono font-semibold text-cyan-300">{formData.backgroundBrightness ?? 80}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={formData.backgroundBrightness ?? 80}
                    onChange={(e) => setFormData({ ...formData, backgroundBrightness: Number(e.target.value) })}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                {/* Background presets */}
                <div>
                  <p className="text-[11px] text-white/50 mb-1.5">Chọn mẫu nền sẵn:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_BACKGROUNDS.map((bg, i) => (
                      <button
                        key={i}
                        onClick={() => setFormData({ ...formData, backgroundUrl: bg.url })}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-purple-400 transition-all text-left"
                      >
                        <img src={bg.url} alt={bg.name} className="w-8 h-8 rounded object-cover" referrerPolicy="no-referrer" />
                        <span className="text-xs text-white/80 truncate">{bg.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO (Bài nhạc, Thanh âm lượng, Tên bài hát) */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-emerald-400" />
                    Tải Nhạc Lên & Điều Chỉnh Thanh Âm Lượng
                  </h3>
                  <p className="text-xs text-white/50 mt-0.5">
                    Tải tệp MP3 của bạn và chỉnh mức âm lượng chuẩn khi người xem mở trang.
                  </p>
                </div>

                {/* Upload MP3 button */}
                <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 cursor-pointer transition-all">
                  <Upload className="w-7 h-7 text-emerald-400 mb-2" />
                  <span className="text-sm font-semibold text-white">Chọn tệp MP3 từ máy của bạn</span>
                  <span className="text-[11px] text-white/50 font-mono mt-0.5">Hỗ trợ MP3, WAV, M4A, OGG</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleSongFile}
                    className="hidden"
                  />
                </label>

                {/* Volume Slider Control (Thanh âm lượng) */}
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-semibold flex items-center gap-1.5 text-emerald-300">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      Thanh âm lượng mặc định (Setup Volume):
                    </span>
                    <span className="font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                      {Math.round((formData.defaultVolume ?? 0.75) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formData.defaultVolume ?? 0.75}
                    onChange={(e) => setFormData({ ...formData, defaultVolume: Number(e.target.value) })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <p className="text-[11px] text-white/50">
                    Khi khách truy cập bấm vào trang, bài hát sẽ tự động phát với mức âm lượng này.
                  </p>
                </div>

                {/* Song title, artist and URL */}
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono text-white/70 block mb-1">Tên bài hát hiển thị:</label>
                      <input
                        type="text"
                        value={formData.songTitle}
                        onChange={(e) => setFormData({ ...formData, songTitle: e.target.value })}
                        placeholder="Ví dụ: Lofi Study Beats"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-emerald-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-white/70 block mb-1">Tên nghệ sĩ / Ca sĩ:</label>
                      <input
                        type="text"
                        value={formData.songArtist}
                        onChange={(e) => setFormData({ ...formData, songArtist: e.target.value })}
                        placeholder="Ví dụ: Văn An Lofi"
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-emerald-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-white/70 block mb-1">Hoặc đường dẫn (URL) bài hát MP3 trực tuyến:</label>
                    <input
                      type="text"
                      value={formData.songUrl}
                      onChange={(e) => setFormData({ ...formData, songUrl: e.target.value })}
                      placeholder="https://.../music.mp3"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-emerald-400 outline-none font-mono"
                    />
                  </div>

                  {/* Song Cover Photo */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-white/20 shrink-0">
                      <img src={formData.songCover} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs cursor-pointer transition-colors">
                        <Upload className="w-3 h-3" />
                        <span>Đổi ảnh bìa đĩa hát</span>
                        <input type="file" accept="image/*" onChange={handleSongCoverFile} className="hidden" />
                      </label>
                      <input
                        type="text"
                        value={formData.songCover}
                        onChange={(e) => setFormData({ ...formData, songCover: e.target.value })}
                        placeholder="URL ảnh bìa đĩa..."
                        className="w-full px-2.5 py-1 rounded bg-black/40 border border-white/10 text-[11px] text-white/80 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-[11px] font-mono text-white/50 mb-2">Hoặc chọn nhạc chill bản quyền mẫu:</p>
                  <div className="space-y-1.5">
                    {PRESET_SONGS.map((song, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            songUrl: song.url,
                            songTitle: song.title,
                            songArtist: song.artist,
                            songCover: song.cover
                          });
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer border transition-all ${
                          formData.songUrl === song.url
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                            : 'bg-black/30 border-white/10 hover:border-white/20 text-white/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={song.cover} alt={song.title} className="w-7 h-7 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <p className="text-xs font-semibold leading-tight">{song.title}</p>
                            <p className="text-[10px] text-white/50">{song.artist}</p>
                          </div>
                        </div>
                        {formData.songUrl === song.url && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL LINKS (Tạo link FB, Dis, TikTok, Roblox có Logo) */}
          {activeTab === 'social' && (
            <div className="space-y-5">
              {/* Form to add a new social link */}
              <div className="p-4 rounded-2xl bg-white/5 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-400" />
                    Thêm Liên Kết Mạng Xã Hội Có Logo
                  </h3>
                  <span className="text-[11px] text-indigo-300 font-mono">Facebook, Discord, Roblox...</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Platform Selector */}
                  <div>
                    <label className="text-xs font-mono text-white/70 block mb-1">Chọn nền tảng (Platform):</label>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-black/60 border border-white/20 text-white flex items-center justify-center">
                        <BrandIcon platform={newPlatform} className="w-5 h-5" />
                      </div>
                      <select
                        value={newPlatform}
                        onChange={(e) => {
                          setNewPlatform(e.target.value);
                          const conf = PLATFORM_OPTIONS.find(p => p.name === e.target.value);
                          if (conf) setNewColor(conf.color);
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-white focus:border-indigo-400 outline-none"
                      >
                        {PLATFORM_OPTIONS.map((p) => (
                          <option key={p.name} value={p.name} className="bg-[#111420] text-white">
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Username / Label */}
                  <div>
                    <label className="text-xs font-mono text-white/70 block mb-1">Tên hiển thị / Username:</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Văn An hoặc vanan#0001"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-indigo-400 outline-none"
                    />
                  </div>

                  {/* URL */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-mono text-white/70 block mb-1">
                      Đường dẫn URL liên kết:
                    </label>
                    <input
                      type="text"
                      placeholder={PLATFORM_OPTIONS.find(p => p.name === newPlatform)?.placeholder || 'https://...'}
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-indigo-400 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleAddSocialLink}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white transition-all shadow-md shadow-indigo-500/25 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm liên kết {newPlatform} vào hồ sơ</span>
                  </button>
                </div>
              </div>

              {/* Existing Social Links List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-white/70 px-1">
                  <span>Danh sách liên kết hiện có ({formData.socialLinks.length}):</span>
                  <span className="text-[11px] text-white/40">Tự động có logo chính thức</span>
                </div>

                {formData.socialLinks.length === 0 ? (
                  <p className="text-xs text-white/40 p-4 text-center border border-dashed border-white/10 rounded-2xl">
                    Chưa có liên kết nào. Hãy thêm Facebook, Discord, Roblox... ở trên!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {formData.socialLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div
                            className="p-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0"
                            style={{ color: link.color || '#38bdf8' }}
                          >
                            <BrandIcon platform={link.platform} className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">{link.platform}</span>
                              <span className="text-[11px] text-cyan-300 font-mono">({link.username})</span>
                            </div>
                            <p className="text-[10px] text-white/50 truncate font-mono">{link.url}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            title="Mở thử link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleRemoveSocialLink(link.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                            title="Xóa liên kết này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE (Thông tin Văn An, Bio, Handle, Trạng thái) */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-white/70 block mb-1">Họ tên hiển thị:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Văn An"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-cyan-400 outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-white/70 block mb-1">Tên tài khoản (Handle):</label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                    placeholder="@vanan.bio"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-cyan-400 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-white/70 block mb-1">Tiêu đề nghề nghiệp / Châm ngôn:</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Creative Developer & Music Enthusiast"
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-white/70 block mb-1">
                  Khái quát về tôi (Giới thiệu bản thân / About Me):
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-cyan-400 outline-none resize-none"
                  placeholder="Giới thiệu đôi nét về sở thích, âm nhạc, đam mê..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-white/70 block mb-1">Trạng thái hoạt động:</label>
                  <input
                    type="text"
                    value={formData.statusText}
                    onChange={(e) => setFormData({ ...formData, statusText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-white/70 block mb-1">Địa điểm:</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              title="Khôi phục thông tin Văn An gốc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đặt lại mặc định</span>
            </button>

            {/* Hidden JSON file input */}
            <input
              type="file"
              ref={jsonInputRef}
              accept=".json"
              onChange={handleImportJsonFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => jsonInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20 transition-colors"
              title="Nhập file sao lưu (.JSON) từ máy"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Nhập file sao lưu (.JSON)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              Đóng
            </button>
            <button
              id="btn-save-profile-config"
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                justSaved
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                  : 'bg-white/15 hover:bg-white/25 text-white active:scale-95'
              }`}
            >
              {justSaved ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-black" />
                  <span>Đã lưu xong!</span>
                </>
              ) : isSaving ? (
                <span>Đang lưu...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu cấu hình</span>
                </>
              )}
            </button>
            <button
              id="btn-export-profile-action"
              onClick={handleExportClick}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Xuất Hồ Sơ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
