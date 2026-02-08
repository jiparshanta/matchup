'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { GameForm } from '@/components/games/GameForm';
import { useToast } from '@/components/ui/Toast';
import { gamesApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function CreateGamePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isLoading: authLoading } = useRequireAuth();

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const createMutation = useMutation({
    mutationFn: gamesApi.create,
    onSuccess: (result) => {
      showToast('Game created successfully!', 'success');
      router.push(`/games/${result.data?.id}`);
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  const handleSubmit = async (data: any) => {
    await createMutation.mutateAsync(data);
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Create a Game</h1>
        <p className="text-gray-600 mt-1">
          Set up a new game and invite players to join
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <GameForm
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending}
            submitLabel="Create Game"
          />
        </CardContent>
      </Card>
    </div>
  );
}
