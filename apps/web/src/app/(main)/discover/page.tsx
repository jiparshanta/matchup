'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { GameCard } from '@/components/games/GameCard';
import { GameFilters } from '@/components/games/GameFilters';
import { GameCardSkeleton } from '@/components/games/GameCardSkeleton';
import { Button } from '@/components/ui/Button';
import { gamesApi } from '@/lib/api';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuthStore } from '@/stores/authStore';
import type { Sport, SkillLevel } from '@matchup/shared';

export default function DiscoverPage() {
  const [selectedSport, setSelectedSport] = useState<Sport | 'all'>('all');
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel | 'all'>('all');
  const { latitude, longitude } = useGeolocation();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['games', selectedSport, selectedSkill, latitude, longitude],
    queryFn: () =>
      gamesApi.list({
        sport: selectedSport === 'all' ? undefined : selectedSport,
        skillLevel: selectedSkill === 'all' ? undefined : selectedSkill,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        radius: 20,
      }),
    staleTime: 30000,
  });

  const games = data?.data || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Discover Games</h1>
        <p className="text-gray-600 mt-0.5 sm:mt-1 text-sm sm:text-base">
          Find and join sports games near you
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <GameFilters
          selectedSport={selectedSport}
          selectedSkill={selectedSkill}
          onSportChange={setSelectedSport}
          onSkillChange={setSelectedSkill}
        />
      </div>

      {/* Games Grid */}
      {isLoading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 px-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
            <svg
              className="h-7 w-7 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Failed to load games
          </h3>
          <p className="text-gray-500 mb-4">Please check your connection and try again</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No games found
          </h3>
          <p className="text-gray-500 mb-4">
            {isAuthenticated
              ? 'Try adjusting your filters or be the first to host a game!'
              : 'Try adjusting your filters or sign up to create your own game!'}
          </p>
          {isAuthenticated ? (
            <Link href="/games/create">
              <Button>Create a Game</Button>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/signup">
                <Button>Sign up to Create</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
            </div>
          )}
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
