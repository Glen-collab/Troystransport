import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWeekDays } from '@/lib/weekUtils';

export default function WeekNavigator({ weekStart, onPrev, onNext, onToday }) {
  const weekEnd = getWeekDays(weekStart)[6];
  const label = `${format(weekStart, 'MMM d')} \u2013 ${format(weekEnd, 'MMM d, yyyy')}`;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={onPrev} className="h-8 w-8">
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={onToday} className="text-xs">
        Today
      </Button>
      <span className="text-sm font-medium min-w-[180px] text-center">{label}</span>
      <Button variant="outline" size="icon" onClick={onNext} className="h-8 w-8">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
