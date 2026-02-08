'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { adminUsersApi } from '@/lib/adminApi';
import type { AdminUserListItem } from '@matchup/shared';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminUsersApi.list({
        search: search || undefined,
        page,
        limit: 20,
      });
      if (response.success && response.data) {
        setUsers(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleBan = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user?')) return;

    setActionLoading(userId);
    try {
      await adminUsersApi.ban(userId, { reason: 'Banned by admin' });
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to ban user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminUsersApi.unban(userId);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to unban user');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage platform users</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
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
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">User</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Phone</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Role</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Games</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Joined</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${user.id}`} className="hover:text-emerald-600">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          {user.email && (
                            <div className="text-sm text-gray-500">{user.email}</div>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.isBanned ? (
                          <Badge variant="danger">Banned</Badge>
                        ) : user.isVerified ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="warning">Unverified</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>Hosted: {user._count.hostedGames}</div>
                        <div>Joined: {user._count.rsvps}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                          {user.role !== 'admin' && (
                            user.isBanned ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnban(user.id)}
                                isLoading={actionLoading === user.id}
                              >
                                Unban
                              </Button>
                            ) : (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleBan(user.id)}
                                isLoading={actionLoading === user.id}
                              >
                                Ban
                              </Button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
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
