import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate, formatTime, getSportEmoji } from '@/lib/utils';
import type { GameWithDetails } from '@/lib/api';

interface GameCardProps {
  game: GameWithDetails;
}

export function GameCard({ game }: GameCardProps) {
  const isFull = game.currentPlayers >= game.maxPlayers;
  const spotsLeft = game.maxPlayers - game.currentPlayers;

  return (
    <Link href={`/games/${game.id}`} className="block">
      <Card className="hover:shadow-md active:scale-[0.99] transition-all duration-200 cursor-pointer touch-manipulation">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getSportEmoji(game.sport)}</span>
              <Badge variant="sport" sport={game.sport}>
                {game.sport.charAt(0).toUpperCase() + game.sport.slice(1)}
              </Badge>
            </div>
            <Badge
              variant={
                game.skillLevel === 'advanced'
                  ? 'danger'
                  : game.skillLevel === 'intermediate'
                  ? 'warning'
                  : 'success'
              }
            >
              {game.skillLevel.charAt(0).toUpperCase() + game.skillLevel.slice(1)}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 text-base">
            {game.title}
          </h3>

          {/* Date & Time */}
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <svg
              className="h-4 w-4 mr-1.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="truncate">
              {formatDate(game.dateTime)} at {formatTime(game.dateTime)}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg
              className="h-4 w-4 mr-1.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="truncate">
              {game.venue?.name || game.customLocation || 'Location TBD'}
              {game.distance !== undefined && (
                <span className="text-gray-400 ml-1">
                  ({game.distance.toFixed(1)} km)
                </span>
              )}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
            {/* Host */}
            <div className="flex items-center gap-2 min-w-0">
              <Avatar
                src={game.host?.avatar}
                alt={game.host?.name || 'Host'}
                size="sm"
              />
              <span className="text-sm text-gray-600 truncate">{game.host?.name}</span>
            </div>

            {/* Players & Price */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="flex items-center text-sm">
                <svg
                  className="h-4 w-4 mr-1 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span
                  className={isFull ? 'text-red-600 font-medium' : 'text-gray-600'}
                >
                  {game.currentPlayers}/{game.maxPlayers}
                </span>
                {!isFull && spotsLeft <= 3 && (
                  <span className="text-orange-500 ml-1 hidden xs:inline">
                    ({spotsLeft} left)
                  </span>
                )}
              </div>

              {game.price !== undefined && game.price > 0 && (
                <span className="text-sm font-semibold text-emerald-600">
                  Rs {game.price}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
