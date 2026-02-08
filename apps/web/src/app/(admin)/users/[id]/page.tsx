'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { adminUsersApi } from '@/lib/adminApi';
import type { User } from '@matchup/shared';

interface UserDetails extends User {
  hostedGames: { id: string; title: string; sport: string; dateTime: string; status: string }[];
  rsvps: { id: string; status: string; game: { id: string; title: string; sport: string; dateTime: string } }[];
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await adminUsersApi.get(userId);
        if (response.success && response.data) {
          setUser(response.data as UserDetails);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleBan = async () => {
    if (!user || !confirm('Are you sure you want to ban this user?')) return;

    setActionLoading(true);
    try {
      const reason = prompt('Enter ban reason (optional):');
      await adminUsersApi.ban(userId, { reason: reason || undefined });
      const response = await adminUsersApi.get(userId);
      if (response.success && response.data) {
        setUser(response.data as UserDetails);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to ban user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!user) return;

    setActionLoading(true);
    try {
      await adminUsersApi.unban(userId);
      const response = await adminUsersApi.get(userId);
      if (response.success && response.data) {
        setUser(response.data as UserDetails);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unban user');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/users" className="hover:text-emerald-600">Users</Link>
            <span>/</span>
            <span>{user.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {user.role !== 'admin' && (
            user.isBanned ? (
              <Button variant="outline" onClick={handleUnban} isLoading={actionLoading}>
                Unban User
              </Button>
            ) : (
              <Button variant="danger" onClick={handleBan} isLoading={actionLoading}>
                Ban User
              </Button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-500">Phone</dt>
                  <dd className="text-gray-900">{user.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Email</dt>
                  <dd className="text-gray-900">{user.email || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Role</dt>
                  <dd>
                    <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                      {user.role}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd>
                    {user.isBanned ? (
                      <Badge variant="danger">Banned</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </dd>
                </div>
                {user.isBanned && user.bannedReason && (
                  <div>
                    <dt className="text-sm text-gray-500">Ban Reason</dt>
                    <dd className="text-gray-900">{user.bannedReason}</dd>
                  </div>
                )}
                {user.isBanned && user.bannedAt && (
                  <div>
                    <dt className="text-sm text-gray-500">Banned At</dt>
                    <dd className="text-gray-900">
                      {new Date(user.bannedAt).toLocaleString()}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-gray-500">Joined</dt>
                  <dd className="text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferred Sports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.preferredSports?.map((sport) => (
                  <Badge key={sport} variant="sport" sport={sport}>
                    {sport}
                  </Badge>
                ))}
                {(!user.preferredSports || user.preferredSports.length === 0) && (
                  <span className="text-gray-500 text-sm">No sports selected</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hosted Games ({user.hostedGames.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {user.hostedGames.length > 0 ? (
                <div className="space-y-3">
                  {user.hostedGames.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{game.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(game.dateTime).toLocaleDateString()} - {game.sport}
                        </div>
                      </div>
                      <Badge
                        variant={
                          game.status === 'upcoming'
                            ? 'info'
                            : game.status === 'completed'
                            ? 'success'
                            : 'default'
                        }
                      >
                        {game.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hosted games</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Game Participations ({user.rsvps.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {user.rsvps.length > 0 ? (
                <div className="space-y-3">
                  {user.rsvps.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{rsvp.game.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(rsvp.game.dateTime).toLocaleDateString()} - {rsvp.game.sport}
                        </div>
                      </div>
                      <Badge
                        variant={
                          rsvp.status === 'confirmed'
                            ? 'success'
                            : rsvp.status === 'waitlisted'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {rsvp.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No game participations</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
