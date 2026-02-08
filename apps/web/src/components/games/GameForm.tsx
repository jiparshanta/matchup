'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { Game, Sport, SkillLevel } from '@matchup/shared';

const gameSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  sport: z.enum(['football', 'cricket', 'basketball', 'volleyball', 'badminton']),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'any']),
  dateTime: z.string().min(1, 'Date and time is required'),
  duration: z.coerce.number().min(30, 'Minimum 30 minutes').max(480, 'Maximum 8 hours'),
  maxPlayers: z.coerce.number().min(2, 'Minimum 2 players').max(50, 'Maximum 50 players'),
  minPlayers: z.coerce.number().min(2, 'Minimum 2 players').max(50),
  customLocation: z.string().min(1, 'Location is required').max(200),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().min(0).max(10000).optional(),
});

type GameFormData = z.infer<typeof gameSchema>;

interface GameFormProps {
  initialData?: Partial<Game>;
  onSubmit: (data: GameFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const SPORTS = [
  { value: 'football', label: 'Football ⚽' },
  { value: 'cricket', label: 'Cricket 🏏' },
  { value: 'basketball', label: 'Basketball 🏀' },
  { value: 'volleyball', label: 'Volleyball 🏐' },
  { value: 'badminton', label: 'Badminton 🏸' },
];

const SKILL_LEVELS = [
  { value: 'any', label: 'Any Level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const DURATIONS = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 hour' },
  { value: '90', label: '1.5 hours' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3 hours' },
  { value: '240', label: '4 hours' },
];

export function GameForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Create Game',
}: GameFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      title: initialData?.title || '',
      sport: (initialData?.sport as Sport) || 'football',
      skillLevel: (initialData?.skillLevel as SkillLevel) || 'any',
      dateTime: initialData?.dateTime
        ? new Date(initialData.dateTime).toISOString().slice(0, 16)
        : '',
      duration: initialData?.duration || 60,
      maxPlayers: initialData?.maxPlayers || 10,
      minPlayers: initialData?.minPlayers || 2,
      customLocation: initialData?.customLocation || '',
      latitude: initialData?.latitude || 27.7172,
      longitude: initialData?.longitude || 85.324,
      description: initialData?.description || '',
      price: initialData?.price || 0,
    },
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

        <Input
          label="Game Title"
          placeholder="e.g., Sunday Football at Ratna Park"
          {...register('title')}
          error={errors.title?.message}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Sport"
            options={SPORTS}
            {...register('sport')}
            error={errors.sport?.message}
          />

          <Select
            label="Skill Level"
            options={SKILL_LEVELS}
            {...register('skillLevel')}
            error={errors.skillLevel?.message}
          />
        </div>
      </div>

      {/* Date & Time */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">When</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Date & Time"
            type="datetime-local"
            {...register('dateTime')}
            error={errors.dateTime?.message}
          />

          <Select
            label="Duration"
            options={DURATIONS}
            {...register('duration')}
            error={errors.duration?.message}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Where</h3>

        <Input
          label="Location"
          placeholder="e.g., Ratna Park Football Ground"
          {...register('customLocation')}
          error={errors.customLocation?.message}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Latitude"
            type="number"
            step="any"
            {...register('latitude')}
            error={errors.latitude?.message}
          />

          <Input
            label="Longitude"
            type="number"
            step="any"
            {...register('longitude')}
            error={errors.longitude?.message}
          />
        </div>

        <Button type="button" variant="outline" onClick={handleGetLocation}>
          Use My Current Location
        </Button>
      </div>

      {/* Players */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Players</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Maximum Players"
            type="number"
            min={2}
            max={50}
            {...register('maxPlayers')}
            error={errors.maxPlayers?.message}
          />

          <Input
            label="Minimum Players"
            type="number"
            min={2}
            max={50}
            {...register('minPlayers')}
            error={errors.minPlayers?.message}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Additional Info</h3>

        <Input
          label="Price per Player (Rs)"
          type="number"
          min={0}
          placeholder="0 for free"
          {...register('price')}
          error={errors.price?.message}
          helperText="Leave as 0 if the game is free"
        />

        <Textarea
          label="Description"
          placeholder="Add any additional details about the game..."
          rows={4}
          {...register('description')}
          error={errors.description?.message}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="submit" size="lg" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
