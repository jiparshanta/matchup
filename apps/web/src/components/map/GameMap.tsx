'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Game } from '@matchup/shared';

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface GameMapProps {
  games: (Game & {
    host?: { id: string; name: string; avatar?: string };
    currentPlayers: number;
  })[];
  center?: [number, number];
  onGameSelect?: (game: Game) => void;
}

export function GameMap({ games, center, onGameSelect }: GameMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    setIsMounted(true);
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  if (!isMounted || !L) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  // Default center to Kathmandu
  const mapCenter = center || [27.7172, 85.324];

  // Sport-specific marker colors
  const sportColors: Record<string, string> = {
    football: '#22c55e',
    cricket: '#eab308',
    basketball: '#f97316',
    volleyball: '#3b82f6',
    badminton: '#a855f7',
  };

  const createIcon = (sport: string) => {
    const color = sportColors[sport] || '#6b7280';
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        "></div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  return (
    <MapContainer
      center={mapCenter as [number, number]}
      zoom={13}
      style={{ width: '100%', height: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {games.map((game) => (
        <Marker
          key={game.id}
          position={[game.latitude, game.longitude]}
          icon={createIcon(game.sport)}
          eventHandlers={{
            click: () => onGameSelect?.(game),
          }}
        >
          <Popup>
            <GamePopup game={game} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function GamePopup({
  game,
}: {
  game: Game & {
    host?: { id: string; name: string; avatar?: string };
    currentPlayers: number;
  };
}) {
  const sportEmojis: Record<string, string> = {
    football: '⚽',
    cricket: '🏏',
    basketball: '🏀',
    volleyball: '🏐',
    badminton: '🏸',
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{sportEmojis[game.sport] || '🎯'}</span>
        <h3 className="font-semibold text-gray-900">{game.title}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-1">
        {formatDate(game.dateTime)} at {formatTime(game.dateTime)}
      </p>
      <p className="text-sm text-gray-600 mb-2">
        {game.currentPlayers}/{game.maxPlayers} players
      </p>
      <a
        href={`/games/${game.id}`}
        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
      >
        View details →
      </a>
    </div>
  );
}
