import React, { useState } from 'react';
import { User } from 'lucide-react';

/**
 * Checks if an avatar URL is an actual custom uploaded photo (not a default Unsplash stock photo)
 */
export function isCustomPhoto(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Disallow default stock photos
  if (trimmed.includes('photo-1534528741775-53994a69daeb')) return false;
  if (trimmed.includes('photo-1507003211169-0a1dd7228f2d')) return false;
  if (trimmed.includes('photo-1544005313-94ddf0286df2')) return false;
  if (trimmed.includes('photo-1500648767791-00dcc994a43e')) return false;
  if (trimmed.includes('photo-1494790108377-be9c29b29330')) return false;
  if (trimmed.includes('photo-1522075469751-3a6694fb2f61')) return false;
  if (trimmed.includes('photo-1535713875002-d1d0cf377fde')) return false;
  if (trimmed.includes('images.unsplash.com')) return false;
  return true;
}

/**
 * Generates user initials from name or email
 */
export function getInitials(name, email) {
  if (name && typeof name === 'string' && name.trim()) {
    const cleanName = name.replace(/\([^)]*\)/g, '').trim(); // Remove suffixes like (Admin)
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
  }
  if (email && typeof email === 'string' && email.trim()) {
    const cleanEmail = email.trim();
    return cleanEmail.slice(0, 2).toUpperCase();
  }
  return 'YG';
}

/**
 * Modern UserAvatar component
 * Renders user's uploaded photo if available, or a clean modern initials badge instead of a stock photo.
 */
export default function UserAvatar({
  user = null,
  name = '',
  email = '',
  avatar = '',
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className = '',
  showOnline = false
}) {
  const [imgError, setImgError] = useState(false);

  const finalName = user?.name || name || '';
  const finalEmail = user?.email || email || '';
  const finalAvatar = user?.avatar || avatar || '';

  const initials = getInitials(finalName, finalEmail);
  const hasValidPhoto = !imgError && isCustomPhoto(finalAvatar);

  // Sizing map
  const sizeMap = {
    xs: {
      box: 'w-6 h-6 rounded-lg text-[10px]',
      icon: 11,
      dot: 'w-2 h-2'
    },
    sm: {
      box: 'w-8 h-8 rounded-lg text-xs',
      icon: 14,
      dot: 'w-2.5 h-2.5'
    },
    md: {
      box: 'w-10 h-10 rounded-xl text-sm',
      icon: 18,
      dot: 'w-3 h-3'
    },
    lg: {
      box: 'w-14 h-14 rounded-2xl text-lg',
      icon: 24,
      dot: 'w-3.5 h-3.5'
    },
    xl: {
      box: 'w-20 h-20 rounded-2xl text-xl',
      icon: 32,
      dot: 'w-4 h-4'
    },
    '2xl': {
      box: 'w-24 h-24 rounded-2xl text-2xl',
      icon: 38,
      dot: 'w-4 h-4'
    }
  };

  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {hasValidPhoto ? (
        <img
          src={finalAvatar}
          alt={finalName || 'User Avatar'}
          onError={() => setImgError(true)}
          className={`${selectedSize.box} object-cover bg-slate-900 border border-slate-700/60`}
        />
      ) : (
        <div
          className={`${selectedSize.box} bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-950 border border-cyan-400/40 text-white font-black tracking-wider flex items-center justify-center select-none shadow-inner`}
          title={finalName || 'YatraGo User'}
        >
          {initials ? (
            <span>{initials}</span>
          ) : (
            <User size={selectedSize.icon} className="text-cyan-200" />
          )}
        </div>
      )}

      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 ${selectedSize.dot} rounded-full bg-emerald-400 ring-2 ring-slate-950`}
          title="Online & Active"
        />
      )}
    </div>
  );
}
