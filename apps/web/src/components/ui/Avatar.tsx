import { type HTMLAttributes, forwardRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = 'md', fallback, ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
      xl: 'h-16 w-16 text-lg',
    };

    const imageSizes = {
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
    };

    const initials = fallback || alt?.charAt(0).toUpperCase() || '?';

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full bg-emerald-100 overflow-hidden',
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={imageSizes[size]}
            height={imageSizes[size]}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="font-medium text-emerald-600">{initials}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
