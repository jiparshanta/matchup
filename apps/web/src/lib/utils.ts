import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export function getSportColor(sport: string): string {
  const colors: Record<string, string> = {
    football: 'bg-sport-football',
    cricket: 'bg-sport-cricket',
    basketball: 'bg-sport-basketball',
    volleyball: 'bg-sport-volleyball',
    badminton: 'bg-sport-badminton',
  };
  return colors[sport] || 'bg-gray-500';
}

export function getSportEmoji(sport: string): string {
  const emojis: Record<string, string> = {
    football: '⚽',
    cricket: '🏏',
    basketball: '🏀',
    volleyball: '🏐',
    badminton: '🏸',
  };
  return emojis[sport] || '🎯';
}
