'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { GameForm } from '@/components/games/GameForm';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { gamesApi } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function EditGamePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const gameId = params.id as string;
  const { isLoading: authLoading } = useRequireAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => gamesApi.get(gameId),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => gamesApi.update(gameId, data),
    onSuccess: () => {
      showToast('Game updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      router.push(`/games/${gameId}`);
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  const handleSubmit = async (data: any) => {
    await updateMutation.mutateAsync(data);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load game</p>
      </div>
    );
  }

  const game = data.data;

  if (!game.isHost) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Only the host can edit this game</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Game</h1>
        <p className="text-gray-600 mt-1">
          Update your game details
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <GameForm
            initialData={game}
            onSubmit={handleSubmit}
            isLoading={updateMutation.isPending}
            submitLabel="Save Changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
