'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/stores/authStore';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { usersApi } from '@/lib/api';
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
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isLoading: authLoading } = useRequireAuth();
  const { user, updateUser } = useAuthStore();

  const [selectedSports, setSelectedSports] = useState<Sport[]>([]);
  const [skillLevels, setSkillLevels] = useState<Record<Sport, SkillLevel>>({} as Record<Sport, SkillLevel>);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  // Initialize form values when user data is available
  useEffect(() => {
    if (user) {
      setSelectedSports((user.preferredSports as Sport[]) || []);
      setSkillLevels((user.skillLevels as Record<Sport, SkillLevel>) || {});
      const initialPhone = user.phone?.replace(/^\+977/, '') || '';
      reset({
        name: user.name || '',
        phone: initialPhone,
      });
    }
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: (result) => {
      if (result.data) {
        updateUser(result.data);
        showToast('Profile updated successfully!', 'success');
        router.push('/profile');
      }
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
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
    await updateMutation.mutateAsync({
      name: data.name,
      phone: data.phone || undefined,
      preferredSports: selectedSports,
      skillLevels,
    });
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg
            className="h-5 w-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-1">Update your profile information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Avatar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.avatar}
                alt={user?.name || 'User'}
                size="xl"
                className="w-20 h-20 text-xl"
              />
              <div>
                <p className="text-sm text-gray-500 mb-2">Profile Photo</p>
                <Button variant="outline" size="sm" type="button" disabled>
                  Change Photo (Coming Soon)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>

            <Input
              label="Full Name"
              placeholder="Enter your name"
              {...register('name')}
              error={errors.name?.message}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input value={user?.email || ''} disabled />
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed
              </p>
            </div>

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
              <p className="mt-1 text-sm text-gray-500">
                Used for contacting you when joining games
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sports Preferences */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Preferred Sports
            </h2>

            <div className="flex flex-wrap gap-2 mb-6">
              {SPORTS.map((sport) => (
                <button
                  key={sport.value}
                  type="button"
                  onClick={() => toggleSport(sport.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedSports.includes(sport.value)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sport.emoji} {sport.label}
                </button>
              ))}
            </div>

            {selectedSports.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Skill Levels
                </h3>
                <div className="space-y-3">
                  {selectedSports.map((sport) => {
                    const sportInfo = SPORTS.find((s) => s.value === sport)!;
                    return (
                      <div
                        key={sport}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-700">
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
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                skillLevels[sport] === level.value
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
