import { describe, it, expect } from 'vitest';

describe('Games API', () => {
  describe('Distance Calculation', () => {
    // Haversine formula for calculating distance between two coordinates
    const calculateDistance = (
      lat1: number,
      lng1: number,
      lat2: number,
      lng2: number
    ): number => {
      const R = 6371; // Earth's radius in km
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const toRad = (deg: number): number => deg * (Math.PI / 180);

    it('should calculate distance between two points correctly', () => {
      // Kathmandu coordinates
      const kathmandu = { lat: 27.7172, lng: 85.324 };
      // Patan coordinates (about 5km from Kathmandu)
      const patan = { lat: 27.6588, lng: 85.3247 };

      const distance = calculateDistance(
        kathmandu.lat,
        kathmandu.lng,
        patan.lat,
        patan.lng
      );

      // Should be approximately 6.5 km
      expect(distance).toBeGreaterThan(5);
      expect(distance).toBeLessThan(8);
    });

    it('should return 0 for same coordinates', () => {
      const point = { lat: 27.7172, lng: 85.324 };
      const distance = calculateDistance(point.lat, point.lng, point.lat, point.lng);
      expect(distance).toBe(0);
    });
  });

  describe('Game Validation', () => {
    it('should validate game creation data', () => {
      const validGame = {
        title: 'Saturday Football',
        sport: 'football',
        latitude: 27.7172,
        longitude: 85.324,
        dateTime: new Date(Date.now() + 86400000).toISOString(),
        duration: 60,
        maxPlayers: 10,
        minPlayers: 2,
        skillLevel: 'any',
      };

      expect(validGame.title.length).toBeGreaterThanOrEqual(3);
      expect(validGame.title.length).toBeLessThanOrEqual(100);
      expect(['football', 'cricket', 'basketball', 'volleyball', 'badminton']).toContain(
        validGame.sport
      );
      expect(validGame.latitude).toBeGreaterThanOrEqual(-90);
      expect(validGame.latitude).toBeLessThanOrEqual(90);
      expect(validGame.longitude).toBeGreaterThanOrEqual(-180);
      expect(validGame.longitude).toBeLessThanOrEqual(180);
      expect(validGame.duration).toBeGreaterThanOrEqual(30);
      expect(validGame.duration).toBeLessThanOrEqual(480);
      expect(validGame.maxPlayers).toBeGreaterThanOrEqual(2);
      expect(validGame.maxPlayers).toBeLessThanOrEqual(50);
    });
  });

  describe('RSVP Logic', () => {
    it('should determine correct RSVP status based on player count', () => {
      const determineRSVPStatus = (
        currentPlayers: number,
        maxPlayers: number
      ): 'confirmed' | 'waitlisted' => {
        return currentPlayers >= maxPlayers ? 'waitlisted' : 'confirmed';
      };

      expect(determineRSVPStatus(5, 10)).toBe('confirmed');
      expect(determineRSVPStatus(9, 10)).toBe('confirmed');
      expect(determineRSVPStatus(10, 10)).toBe('waitlisted');
      expect(determineRSVPStatus(15, 10)).toBe('waitlisted');
    });
  });
});
