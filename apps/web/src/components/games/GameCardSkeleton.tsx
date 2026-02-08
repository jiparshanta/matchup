import { Card } from '@/components/ui/Card';

export function GameCardSkeleton() {
  return (
    <Card>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
        </div>

        {/* Title */}
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>

        {/* Date */}
        <div className="flex items-center mb-2">
          <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 w-40 bg-gray-200 rounded"></div>
        </div>

        {/* Location */}
        <div className="flex items-center mb-3">
          <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    </Card>
  );
}
