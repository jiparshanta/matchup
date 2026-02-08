'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/discover',
    label: 'Discover',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    href: '/map',
    label: 'Map',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    href: '/games/create',
    label: 'Create',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    highlight: true,
  },
  {
    href: '/my-games',
    label: 'My Games',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 md:hidden z-50">
      <div
        className="flex justify-around items-center h-16 px-1"
        style={{ paddingBottom: 'var(--safe-area-inset-bottom)' }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 no-select',
                item.highlight
                  ? 'text-white'
                  : isActive
                  ? 'text-emerald-600'
                  : 'text-gray-400 active:text-gray-600'
              )}
            >
              {item.highlight ? (
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full -mt-7 shadow-lg shadow-emerald-500/30 active:scale-95 transition-transform">
                  {item.icon}
                </div>
              ) : (
                <>
                  <div className={cn(
                    'p-1 rounded-lg transition-colors',
                    isActive && 'bg-emerald-50'
                  )}>
                    {item.icon}
                  </div>
                  <span className={cn(
                    'text-[10px] mt-0.5 font-medium',
                    isActive ? 'text-emerald-600' : 'text-gray-500'
                  )}>
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
