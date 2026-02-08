'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { adminVenuesApi } from '@/lib/adminApi';
import type { AdminVenueListItem } from '@matchup/shared';

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<AdminVenueListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchVenues = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminVenuesApi.list({
        search: search || undefined,
        page,
        limit: 20,
      });
      if (response.success && response.data) {
        setVenues(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch venues:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVenues();
  };

  const handleDelete = async (venueId: string, venueName: string) => {
    if (!confirm(`Are you sure you want to delete "${venueName}"?`)) {
      return;
    }

    setDeleteLoading(venueId);
    try {
      await adminVenuesApi.delete(venueId);
      fetchVenues();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete venue');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venues</h1>
          <p className="text-gray-600">Manage platform venues</p>
        </div>
        <Link href="/admin/venues/new">
          <Button>Add Venue</Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Search by name or address..."
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
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Venue</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Address</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Sports</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Price/hr</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Games</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Partner</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((venue) => (
                    <tr key={venue.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{venue.name}</div>
                        {venue.contactPhone && (
                          <div className="text-sm text-gray-500">{venue.contactPhone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {venue.address}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {venue.sports.map((sport) => (
                            <Badge key={sport} variant="sport" sport={sport}>
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {venue.pricePerHour ? `NPR ${venue.pricePerHour}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {venue._count.games}
                      </td>
                      <td className="px-4 py-3">
                        {venue.isPartner ? (
                          <Badge variant="success">Partner</Badge>
                        ) : (
                          <Badge variant="default">Regular</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/venues/${venue.id}`}>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(venue.id, venue.name)}
                            isLoading={deleteLoading === venue.id}
                            disabled={venue._count.games > 0}
                            title={venue._count.games > 0 ? 'Cannot delete venue with games' : ''}
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

            {venues.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No venues found</p>
                <Link href="/admin/venues/new">
                  <Button className="mt-4">Add First Venue</Button>
                </Link>
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
