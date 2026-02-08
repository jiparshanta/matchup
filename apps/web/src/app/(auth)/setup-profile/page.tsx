'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Sport, SkillLevel } from '@matchup/shared';

const SPORTS: { value: Sport; label: string; emoji: string }[] = [
  { value: 'football', label: 'Football', emoji: '⚽' },
  { value: 'cricket', label: 'Cricket', emoji: '🏏' },
  { value: 'basketball', label: 'Basketball', emoji: '🏀' },
  { value: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { value: 'badminton', label: 'Badminton', emoji: '🏸' },
];

const SKILL_LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const profileSchema = z.object({
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function SetupProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSports, setSelectedSports] = useState<Sport[]>([]);
  const [skillLevels, setSkillLevels] = useState<Record<Sport, SkillLevel>>({} as Record<Sport, SkillLevel>);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: user?.phone || '',
    },
  });

  const toggleSport = (sport: Sport) => {
    setSelectedSports((prev) => {
      if (prev.includes(sport)) {
        const newSkillLevels = { ...skillLevels };
        delete newSkillLevels[sport];
        setSkillLevels(newSkillLevels);
        return prev.filter((s) => s !== sport);
      }
      setSkillLevels((prev) => ({ ...prev, [sport]: 'intermediate' }));
      return [...prev, sport];
    });
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (selectedSports.length === 0) {
      showToast('Please select at least one sport', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Normalize phone if provided
      let phone = data.phone;
      if (phone && !phone.startsWith('+977')) {
        phone = '+977' + phone;
      }

      const result = await usersApi.updateProfile({
        phone: phone || undefined,
        preferredSports: selectedSports,
        skillLevels,
      });

      if (result.success && result.data) {
        updateUser(result.data);
        showToast('Profile setup complete!', 'success');
        router.push('/discover');
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update profile',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl shadow-gray-200/50 border-0">
      <CardContent className="p-5 sm:p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
            Complete your profile
          </h2>
          <p className="text-gray-500 text-sm">
            Tell us about your sports preferences
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Phone number field - show only if not already set */}
          {!user?.phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                  +977
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="98XXXXXXXX"
                  {...register('phone')}
                  className="flex-1 block w-full rounded-r-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-all"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Used for contacting you when joining games
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What sports do you play?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SPORTS.map((sport) => (
                <button
                  key={sport.value}
                  type="button"
                  onClick={() => toggleSport(sport.value)}
                  className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                    selectedSports.includes(sport.value)
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{sport.emoji}</span>
                  {sport.label}
                </button>
              ))}
            </div>
          </div>

          {selectedSports.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Your skill level
              </label>
              <div className="space-y-3">
                {selectedSports.map((sport) => {
                  const sportInfo = SPORTS.find((s) => s.value === sport)!;
                  return (
                    <div
                      key={sport}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {sportInfo.emoji} {sportInfo.label}
                      </span>
                      <div className="flex gap-1">
                        {SKILL_LEVELS.map((level) => (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() =>
                              setSkillLevels((prev) => ({
                                ...prev,
                                [sport]: level.value,
                              }))
                            }
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.95] ${
                              skillLevels[sport] === level.value
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            disabled={selectedSports.length === 0}
          >
            Get Started
          </Button>

          {selectedSports.length === 0 && (
            <p className="text-center text-xs text-gray-400">
              Select at least one sport to continue
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
