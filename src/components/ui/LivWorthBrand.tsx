import React from 'react';

interface BrandProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

/**
 * Official LivWorthy Icon Mark
 * The dark navy rounded tile with the white/teal LW growth mark.
 */
export const LivWorthyIcon: React.FC<{ className?: string; size?: number; alt?: string }> = ({
  className = '',
  size = 36,
  alt = 'LivWorthy',
}) => {
  return (
    <img
      src="/icon.png"
      alt={alt}
      width={size}
      height={size}
      className={`rounded-lg object-contain shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, aspectRatio: '1 / 1' }}
      loading="eager"
    />
  );
};

/**
 * Official LivWorthy App Icon Tile
 */
export const LivWorthyAppIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 48,
  className = '',
}) => {
  return (
    <LivWorthyIcon size={size} className={className} />
  );
};

/**
 * Official LivWorthy Full Brand Logo
 * Uses the supplied official brand asset with exact aspect ratio preservation.
 * Includes meaningful alt text 'LivWorthy'.
 */
export const LivWorthyLogo: React.FC<BrandProps> = ({
  className = '',
  size = 'md',
}) => {
  // Height classes scaled for crisp desktop & mobile viewports
  const heights = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
    xl: 'h-16 sm:h-20',
  };

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src="/logo.png"
        alt="LivWorthy"
        className={`w-auto ${heights[size]} object-contain`}
        style={{ aspectRatio: '3836 / 1340' }}
        loading="eager"
      />
    </div>
  );
};

// Aliases for seamless internal compatibility
export const LivWorthLogo = LivWorthyLogo;
export const LivWorthIcon = LivWorthyIcon;
export const LivWorthAppIcon = LivWorthyAppIcon;
