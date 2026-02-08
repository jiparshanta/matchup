'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { PlayerList } from '@/components/games/PlayerList';
import { gamesApi } from '@/lib/api';
import { formatDate, formatTime, formatDuration, getSportEmoji } from '@/lib/utils';
import { useGameSocket } from '@/hooks/useGameSocket';
import { useAuthStore } from '@/stores/authStore';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const gameId = params.id as string;
  const { isAuthenticated } = useAuthStore();

  // Enable real-time updates for this game
  useGameSocket(gameId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['game', gameId],
    queryFn: () => gamesApi.get(gameId),
  });

  const joinMutation = useMutation({
    mutationFn: () => gamesApi.join(gameId),
    onSuccess: (result) => {
      showToast(result.data?.message || 'Joined successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => gamesApi.leave(gameId),
    onSuccess: () => {
      showToast('Left the game', 'success');
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => gamesApi.update(gameId, { status: 'cancelled' }),
    onSuccess: () => {
      showToast('Game cancelled', 'success');
      router.push('/my-games');
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load game details</p>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  const game = data.data;
  const isFull = game.currentPlayers >= game.maxPlayers;
  const hasJoined = game.userRsvpStatus === 'confirmed' || game.userRsvpStatus === 'waitlisted';
  const isWaitlisted = game.userRsvpStatus === 'waitlisted';
  const isCancelled = game.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Header */}
          <Card>
            <CardContent className="pt-6">
              {isCancelled && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    This game has been cancelled
                  </p>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{getSportEmoji(game.sport)}</span>
                  <div>
                    <Badge variant="sport" sport={game.sport} className="mb-1">
                      {game.sport.charAt(0).toUpperCase() + game.sport.slice(1)}
                    </Badge>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {game.title}
                    </h1>
                  </div>
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

              {/* Host */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                <Avatar
                  src={game.host?.avatar}
                  alt={game.host?.name || 'Host'}
                  size="md"
                />
                <div>
                  <p className="text-sm text-gray-500">Hosted by</p>
                  <p className="font-medium text-gray-900">{game.host?.name}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <svg
                      className="h-5 w-5 text-primary-600"
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
                  <div>
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(game.dateTime)}
                    </p>
                    <p className="text-gray-600">
                      {formatTime(game.dateTime)} ({formatDuration(game.duration)})
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <svg
                      className="h-5 w-5 text-primary-600"
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
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">
                      {game.venue?.name || game.customLocation || 'TBD'}
                    </p>
                    {game.venue?.address && (
                      <p className="text-gray-600">{game.venue.address}</p>
                    )}
                  </div>
                </div>

                {/* Players */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <svg
                      className="h-5 w-5 text-primary-600"
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
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Players</p>
                    <p className="font-medium text-gray-900">
                      {game.currentPlayers} / {game.maxPlayers}
                    </p>
                    <p className="text-gray-600">
                      Min {game.minPlayers} required
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <svg
                      className="h-5 w-5 text-primary-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-medium text-gray-900">
                      {game.price ? `Rs ${game.price}` : 'Free'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {game.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    About this game
                  </h3>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {game.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Players Lists */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <PlayerList
                  title={`Confirmed Players (${game.confirmedPlayers.length})`}
                  players={game.confirmedPlayers}
                  hostId={game.hostId}
                />

                {game.waitlistedPlayers.length > 0 && (
                  <PlayerList
                    title={`Waitlist (${game.waitlistedPlayers.length})`}
                    players={game.waitlistedPlayers}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Action Card */}
          <Card>
            <CardContent className="pt-6">
              {!isCancelled && (
                <>
                  {game.isHost ? (
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/games/${gameId}/edit`)}
                      >
                        Edit Game
                      </Button>
                      <Button
                        variant="danger"
                        className="w-full"
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this game?')) {
                            cancelMutation.mutate();
                          }
                        }}
                        isLoading={cancelMutation.isPending}
                      >
                        Cancel Game
                      </Button>
                    </div>
                  ) : hasJoined ? (
                    <div className="space-y-3">
                      {isWaitlisted && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-3">
                          <p className="text-sm text-yellow-700">
                            You're on the waitlist. You'll be notified if a spot opens up.
                          </p>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => leaveMutation.mutate()}
                        isLoading={leaveMutation.isPending}
                      >
                        Leave Game
                      </Button>
                    </div>
                  ) : !isAuthenticated ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 text-center mb-2">
                        Sign in to join this game
                      </p>
                      <Link href="/login" className="block">
                        <Button className="w-full">
                          Login to Join
                        </Button>
                      </Link>
                      <Link href="/signup" className="block">
                        <Button variant="outline" className="w-full">
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={isFull}
                      onClick={() => joinMutation.mutate()}
                      isLoading={joinMutation.isPending}
                    >
                      {isFull ? 'Game is Full - Join Waitlist' : 'Join Game'}
                    </Button>
                  )}
                </>
              )}

              {/* Status info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <Badge
                    variant={
                      isCancelled
                        ? 'danger'
                        : isFull
                        ? 'warning'
                        : 'success'
                    }
                  >
                    {isCancelled
                      ? 'Cancelled'
                      : isFull
                      ? 'Full'
                      : `${game.maxPlayers - game.currentPlayers} spots left`}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Host */}
          {!game.isHost && game.host?.phone && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Contact Host
                </h3>
                <a
                  href={`tel:${game.host.phone}`}
                  className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {game.host.phone}
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
