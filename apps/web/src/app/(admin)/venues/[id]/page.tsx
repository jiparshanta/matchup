'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { adminVenuesApi } from '@/lib/adminApi';
import type { Sport, Venue } from '@matchup/shared';

const allSports: Sport[] = ['football', 'cricket', 'basketball', 'volleyball', 'badminton'];

interface VenueDetails extends Venue {
  contactPhone?: string;
  games: { id: string; title: string; sport: string; dateTime: string; status: string }[];
}

export default function AdminEditVenuePage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;

  const [venue, setVenue] = useState<VenueDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    pricePerHour: '',
    contactPhone: '',
    isPartner: false,
    sports: [] as Sport[],
    amenities: '',
  });

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await adminVenuesApi.get(venueId);
        if (response.success && response.data) {
          const v = response.data as VenueDetails;
          setVenue(v);
          setFormData({
            name: v.name,
            address: v.address,
            latitude: String(v.latitude),
            longitude: String(v.longitude),
            pricePerHour: v.pricePerHour ? String(v.pricePerHour) : '',
            contactPhone: v.contactPhone || '',
            isPartner: v.isPartner,
            sports: v.sports,
            amenities: v.amenities.join(', '),
          });
        }
      } catch (err) {
        console.error('Failed to fetch venue:', err);
        setError('Failed to load venue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenue();
  }, [venueId]);

  const handleSportToggle = (sport: Sport) => {
    setFormData((prev) => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter((s) => s !== sport)
        : [...prev.sports, sport],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const response = await adminVenuesApi.update(venueId, {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        pricePerHour: formData.pricePerHour ? parseInt(formData.pricePerHour) : undefined,
        contactPhone: formData.contactPhone || undefined,
        isPartner: formData.isPartner,
        sports: formData.sports,
        amenities: formData.amenities
          ? formData.amenities.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
      });

      if (response.success) {
        router.push('/admin/venues');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update venue');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || 'Venue not found'}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/admin/venues" className="hover:text-emerald-600">Venues</Link>
          <span>/</span>
          <span>{venue.name}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Venue</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Venue Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Venue Name *"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Futsal Arena Thamel"
            />

            <Textarea
              label="Address *"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Full address of the venue"
              rows={2}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude *"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                placeholder="e.g., 27.7152"
              />
              <Input
                label="Longitude *"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                placeholder="e.g., 85.3123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sports Available
              </label>
              <div className="flex flex-wrap gap-2">
                {allSports.map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => handleSportToggle(sport)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.sports.includes(sport)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price per Hour (NPR)"
                type="number"
                value={formData.pricePerHour}
                onChange={(e) => setFormData((prev) => ({ ...prev, pricePerHour: e.target.value }))}
                placeholder="e.g., 2500"
              />
              <Input
                label="Contact Phone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="e.g., +9779841234567"
              />
            </div>

            <Input
              label="Amenities (comma-separated)"
              value={formData.amenities}
              onChange={(e) => setFormData((prev) => ({ ...prev, amenities: e.target.value }))}
              placeholder="e.g., Changing Room, Parking, Water, Lighting"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPartner"
                checked={formData.isPartner}
                onChange={(e) => setFormData((prev) => ({ ...prev, isPartner: e.target.checked }))}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <label htmlFor="isPartner" className="text-sm font-medium text-gray-700">
                Partner Venue
              </label>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" isLoading={isSaving}>
                Save Changes
              </Button>
              <Link href="/admin/venues">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {venue.games.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Games at this Venue ({venue.games.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {venue.games.map((game) => (
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
                  <span className="text-sm text-gray-500">{game.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
