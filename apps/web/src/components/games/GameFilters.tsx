'use client';

import { cn } from '@/lib/utils';
import type { Sport, SkillLevel } from '@matchup/shared';

interface GameFiltersProps {
  selectedSport: Sport | 'all';
  selectedSkill: SkillLevel | 'all';
  onSportChange: (sport: Sport | 'all') => void;
  onSkillChange: (skill: SkillLevel | 'all') => void;
}

const SPORTS: { value: Sport | 'all'; label: string; emoji?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'football', label: 'Football', emoji: '⚽' },
  { value: 'cricket', label: 'Cricket', emoji: '🏏' },
  { value: 'basketball', label: 'Basketball', emoji: '🏀' },
  { value: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { value: 'badminton', label: 'Badminton', emoji: '🏸' },
];

const SKILL_LEVELS: { value: SkillLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function GameFilters({
  selectedSport,
  selectedSkill,
  onSportChange,
  onSkillChange,
}: GameFiltersProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Sports Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Sport</h3>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
          {SPORTS.map((sport) => (
            <button
              key={sport.value}
              onClick={() => onSportChange(sport.value)}
              className={cn(
                'flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-all',
                'active:scale-95 touch-manipulation select-none',
                selectedSport === sport.value
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              )}
            >
              {sport.emoji && <span className="mr-1">{sport.emoji}</span>}
              {sport.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Level Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Skill Level</h3>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
          {SKILL_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => onSkillChange(level.value)}
              className={cn(
                'flex-shrink-0 px-3 py-2 rounded-full text-sm font-medium transition-all',
                'active:scale-95 touch-manipulation select-none',
                selectedSkill === level.value
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              )}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
