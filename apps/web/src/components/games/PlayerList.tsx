import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface PlayerListProps {
  title: string;
  players: Player[];
  hostId?: string;
  emptyMessage?: string;
}

export function PlayerList({
  title,
  players,
  hostId,
  emptyMessage = 'No players yet',
}: PlayerListProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      {players.length === 0 ? (
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Avatar src={player.avatar} alt={player.name} size="sm" />
                <span className="text-sm font-medium text-gray-900">
                  {player.name}
                </span>
              </div>
              {player.id === hostId && (
                <Badge variant="info">Host</Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
