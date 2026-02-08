'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { adminGamesApi } from '@/lib/adminApi';
import type { AdminGameListItem } from '@matchup/shared';

const sportOptions = [
  { value: '', label: 'All Sports' },
  { value: 'football', label: 'Football' },
  { value: 'cricket', label: 'Cricket' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'volleyball', label: 'Volleyball' },
  { value: 'badminton', label: 'Badminton' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminGamesPage() {
  const [games, setGames] = useState<AdminGameListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminGamesApi.list({
        search: search || undefined,
        sport: sport || undefined,
        status: status || undefined,
        page,
        limit: 20,
      });
      if (response.success && response.data) {
        setGames(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch games:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, sport, status, page]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGames();
  };

  const handleDelete = async (gameId: string, gameTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${gameTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(gameId);
    try {
      await adminGamesApi.delete(gameId);
      fetchGames();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete game');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Games</h1>
        <p className="text-gray-600">View and manage all games</p>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by title or host..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
            <Select
              value={sport}
              onChange={(e) => {
                setSport(e.target.value);
                setPage(1);
              }}
              options={sportOptions}
            />
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={statusOptions}
            />
            <Button type="submit">Search</Button>
          </form>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Game</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Sport</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Host</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Venue</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Players</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr key={game.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{game.title}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="sport" sport={game.sport}>
                          {game.sport}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/users/${game.host.id}`}
                          className="text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          {game.host.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {game.venue?.name || 'Custom location'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {game.currentPlayers} / {game.maxPlayers}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(game.dateTime).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusBadgeVariant(game.status)}>
                          {game.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/games/${game.id}`} target="_blank">
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(game.id, game.title)}
                            isLoading={deleteLoading === game.id}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {games.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No games found</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
