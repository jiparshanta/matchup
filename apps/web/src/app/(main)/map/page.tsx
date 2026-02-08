'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { GameFilters } from '@/components/games/GameFilters';
import { gamesApi } from '@/lib/api';
import { useGeolocation } from '@/hooks/useGeolocation';
import type { Sport, SkillLevel } from '@matchup/shared';

// Dynamically import map component to avoid SSR issues
const GameMap = dynamic(
  () => import('@/components/map/GameMap').then((mod) => mod.GameMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    ),
  }
);

export default function MapPage() {
  const [selectedSport, setSelectedSport] = useState<Sport | 'all'>('all');
  const [selectedSkill, setSelectedSkill] = useState<SkillLevel | 'all'>('all');
  const { latitude, longitude } = useGeolocation();

  const { data, isLoading } = useQuery({
    queryKey: ['games', 'map', selectedSport, selectedSkill],
    queryFn: () =>
      gamesApi.list({
        sport: selectedSport === 'all' ? undefined : selectedSport,
        skillLevel: selectedSkill === 'all' ? undefined : selectedSkill,
        limit: 100,
      }),
  });

  const games = data?.data || [];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <GameFilters
          selectedSport={selectedSport}
          selectedSkill={selectedSkill}
          onSportChange={setSelectedSport}
          onSkillChange={setSelectedSkill}
        />
      </div>

      {/* Map */}
      <div className="flex-1 rounded-xl overflow-hidden border border-gray-200">
        <GameMap
          games={games}
          center={latitude && longitude ? [latitude, longitude] : undefined}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Sport Colors</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { sport: 'Football', color: 'bg-green-500', emoji: '⚽' },
            { sport: 'Cricket', color: 'bg-yellow-500', emoji: '🏏' },
            { sport: 'Basketball', color: 'bg-orange-500', emoji: '🏀' },
            { sport: 'Volleyball', color: 'bg-blue-500', emoji: '🏐' },
            { sport: 'Badminton', color: 'bg-purple-500', emoji: '🏸' },
          ].map((item) => (
            <div key={item.sport} className="flex items-center gap-2">
              <span
                className={`w-4 h-4 rounded-full ${item.color}`}
              ></span>
              <span className="text-sm text-gray-600">
                {item.emoji} {item.sport}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
