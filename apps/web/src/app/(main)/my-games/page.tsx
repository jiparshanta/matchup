'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { GameCard } from '@/components/games/GameCard';
import { GameCardSkeleton } from '@/components/games/GameCardSkeleton';
import { Button } from '@/components/ui/Button';
import { gamesApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useRequireAuth';

type Tab = 'hosted' | 'joined';

export default function MyGamesPage() {
  const { isLoading: authLoading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState<Tab>('joined');

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const { data: hostedData, isLoading: hostedLoading } = useQuery({
    queryKey: ['games', 'hosted'],
    queryFn: gamesApi.myHosted,
  });

  const { data: joinedData, isLoading: joinedLoading } = useQuery({
    queryKey: ['games', 'joined'],
    queryFn: gamesApi.myJoined,
  });

  const hostedGames = hostedData?.data || [];
  const joinedGames = joinedData?.data || [];
  const isLoading = activeTab === 'hosted' ? hostedLoading : joinedLoading;
  const games = activeTab === 'hosted' ? hostedGames : joinedGames;

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Games</h1>
        <p className="text-gray-600 mt-0.5 sm:mt-1 text-sm sm:text-base">
          Games you're hosting or participating in
        </p>
      </div>

      {/* Tabs - Pill style for mobile */}
      <div className="bg-gray-100 rounded-xl p-1 mb-4 sm:mb-6 flex">
        <button
          onClick={() => setActiveTab('joined')}
          className={cn(
            'flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all active:scale-[0.98]',
            activeTab === 'joined'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600'
          )}
        >
          Joined
          {joinedGames.length > 0 && (
            <span className={cn(
              'ml-1.5 py-0.5 px-2 rounded-full text-xs',
              activeTab === 'joined' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
            )}>
              {joinedGames.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('hosted')}
          className={cn(
            'flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all active:scale-[0.98]',
            activeTab === 'hosted'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-gray-600'
          )}
        >
          Hosted
          {hostedGames.length > 0 && (
            <span className={cn(
              'ml-1.5 py-0.5 px-2 rounded-full text-xs',
              activeTab === 'hosted' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
            )}>
              {hostedGames.length}
            </span>
          )}
        </button>
      </div>

      {/* Games Grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg
              className="h-8 w-8 text-gray-400"
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
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {activeTab === 'hosted'
              ? 'No hosted games yet'
              : 'No joined games yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'hosted'
              ? 'Create your first game to get started!'
              : 'Browse and join games from the discover page.'}
          </p>
          <Link href={activeTab === 'hosted' ? '/games/create' : '/discover'}>
            <Button>
              {activeTab === 'hosted' ? 'Create a Game' : 'Discover Games'}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
