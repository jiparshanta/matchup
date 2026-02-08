'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { adminStatsApi } from '@/lib/adminApi';
import type { AdminStats } from '@matchup/shared';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminStatsApi.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-500' },
    { label: 'Total Games', value: stats.totalGames, color: 'bg-emerald-500' },
    { label: 'Total Venues', value: stats.totalVenues, color: 'bg-purple-500' },
    { label: 'Active Games', value: stats.activeGames, color: 'bg-orange-500' },
    { label: 'New Users (7 days)', value: stats.recentUsers, color: 'bg-cyan-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${stat.color}`} />
            <CardContent className="p-4">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Games by Sport</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.gamesBySport.map((item) => (
                <div key={item.sport} className="flex items-center justify-between">
                  <span className="capitalize text-gray-700">{item.sport}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${stats.totalGames > 0 ? (item.count / stats.totalGames) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
              {stats.gamesBySport.length === 0 && (
                <p className="text-gray-500 text-sm">No games yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/admin/users"
                className="p-4 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-center"
              >
                <div className="text-2xl mb-1">
                  <svg className="w-8 h-8 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Manage Users</span>
              </a>
              <a
                href="/admin/games"
                className="p-4 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-center"
              >
                <div className="text-2xl mb-1">
                  <svg className="w-8 h-8 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">View Games</span>
              </a>
              <a
                href="/admin/venues"
                className="p-4 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-center"
              >
                <div className="text-2xl mb-1">
                  <svg className="w-8 h-8 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Manage Venues</span>
              </a>
              <a
                href="/admin/venues/new"
                className="p-4 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-center"
              >
                <div className="text-2xl mb-1">
                  <svg className="w-8 h-8 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">Add Venue</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
