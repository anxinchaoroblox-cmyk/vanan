import React, { useState } from 'react';
import { X, Check, Copy, Download, ExternalLink, Sparkles, Share2, CheckCircle2, QrCode } from 'lucide-react';
import { ProfileData } from '../types';
import { getSharableUrl, downloadProfileJson } from '../utils/shareHelper';
import { BrandIcon } from './BrandIcon';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const shareUrl = getSharableUrl(profile);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.getElementById('share-url-input') as HTMLInputElement;
        if (input) {
          input.select();
          document.execCommand('copy');
        }
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadJson = () => {
    downloadProfileJson(profile);
  };

  // QR Code URL using free reliable QR service
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div
      id="export-profile-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#111422] border border-cyan-500/30 shadow-2xl overflow-hidden text-white">
        {/* Glow Header */}
        <div className="relative px-6 py-5 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-[#111422] to-purple-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/20">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display flex items-center gap-2">
                <span>Xuất Bản Hồ Sơ Thành Công!</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Live
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Hồ sơ của <span className="text-cyan-300 font-semibold">{profile.name}</span> đã sẵn sàng để chia sẻ
              </p>
            </div>
          </div>
          <button
            id="btn-close-export-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Tổng quan cấu hình bạn đã tạo:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-white/50 block text-[11px]">Chủ sở hữu:</span>
                <span className="font-semibold text-white truncate block">{profile.name} ({profile.handle})</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-white/50 block text-[11px]">Âm lượng mặc định:</span>
                <span className="font-semibold text-emerald-400 block">{Math.round((profile.defaultVolume ?? 0.75) * 100)}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 col-span-2">
                <span className="text-white/50 block text-[11px]">Bài nhạc nền:</span>
                <span className="font-semibold text-cyan-300 truncate block">
                  {profile.songTitle} - {profile.songArtist}
                </span>
              </div>
            </div>

            {/* Social links preview */}
            {profile.socialLinks && profile.socialLinks.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] text-white/50 block mb-1.5">Liên kết mạng xã hội có logo ({profile.socialLinks.length}):</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.socialLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 text-xs"
                      style={{ color: link.color || '#fff' }}
                    >
                      <BrandIcon platform={link.platform} className="w-3.5 h-3.5" />
                      <span className="text-white/90 text-[11px]">{link.platform}: {link.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Share Link Field */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                Đường dẫn liên kết hồ sơ của bạn (Shareable URL):
              </span>
              <span className="text-[11px] text-cyan-400/80 font-mono">Bất kỳ ai mở đều thấy đúng thiết lập này</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-cyan-500/30 text-xs text-cyan-200 font-mono focus:outline-none select-all"
              />
              <button
                id="btn-copy-share-url"
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/25 active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions: QR Code & Download File */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setShowQr(!showQr)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/90 transition-colors"
            >
              <QrCode className="w-4 h-4 text-purple-400" />
              <span>{showQr ? 'Ẩn mã QR' : 'Mã QR quét nhanh'}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/90 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Tải file cấu hình (.JSON)</span>
            </button>
          </div>

          {/* QR Code Expansion */}
          {showQr && (
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-200">
              <p className="text-xs text-white/60">Quét mã để xem hồ sơ trên điện thoại:</p>
              <div className="p-2 bg-white rounded-xl shadow-lg">
                <img src={qrCodeUrl} alt="Profile QR Code" className="w-36 h-36" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <p className="text-[11px] text-white/50">
            Dữ liệu đã được lưu vĩnh viễn trên trình duyệt của bạn.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
