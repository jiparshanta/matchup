'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { gamesApi } from '@/lib/api';
import { getSportEmoji } from '@/lib/utils';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useRequireAuth();

  const { data: hostedData } = useQuery({
    queryKey: ['games', 'hosted'],
    queryFn: gamesApi.myHosted,
    enabled: !authLoading && !!user,
  });

  const { data: joinedData } = useQuery({
    queryKey: ['games', 'joined'],
    queryFn: gamesApi.myJoined,
    enabled: !authLoading && !!user,
  });

  const hostedGames = hostedData?.data || [];
  const joinedGames = joinedData?.data || [];

  if (authLoading || !user) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = [
    { label: 'Games Hosted', value: hostedGames.length },
    { label: 'Games Joined', value: joinedGames.length },
    { label: 'Sports', value: user.preferredSports?.length || 0 },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar
              src={user.avatar}
              alt={user.name}
              size="xl"
              className="w-24 h-24 text-2xl"
            />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              {user.phone && (
                <p className="text-gray-500 text-sm">{user.phone}</p>
              )}
              <div className="mt-4">
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="pt-4 pb-4">
              <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preferred Sports */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Preferred Sports
          </h2>
          {user.preferredSports && user.preferredSports.length > 0 ? (
            <div className="space-y-3">
              {user.preferredSports.map((sport) => (
                <div
                  key={sport}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getSportEmoji(sport)}</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {sport}
                    </span>
                  </div>
                  {user.skillLevels?.[sport] && (
                    <Badge
                      variant={
                        user.skillLevels[sport] === 'advanced'
                          ? 'danger'
                          : user.skillLevels[sport] === 'intermediate'
                          ? 'warning'
                          : 'success'
                      }
                    >
                      {user.skillLevels[sport].charAt(0).toUpperCase() +
                        user.skillLevels[sport].slice(1)}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No sports selected yet</p>
              <Link href="/profile/edit">
                <Button variant="outline" size="sm" className="mt-2">
                  Add Sports
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-gray-500">Email</dt>
              <dd className="text-gray-900 font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <dt className="text-gray-500">Phone</dt>
              <dd className="text-gray-900 font-medium">
                {user.phone || 'Not set'}
              </dd>
            </div>
            <div className="flex justify-between py-2">
              <dt className="text-gray-500">Member since</dt>
              <dd className="text-gray-900 font-medium">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Unknown'}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
