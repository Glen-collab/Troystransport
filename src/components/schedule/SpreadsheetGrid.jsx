import { format, isToday } from 'date-fns';
import { getWeekDays, toDateString } from '@/lib/weekUtils';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

export default function SpreadsheetGrid({ weekStart, farms, loads, isAdmin, onAddLoad, onClickLoad }) {
  const days = getWeekDays(weekStart);

  const getLoadsForCell = (farmId, date) => {
    const dateStr = toDateString(date);
    return loads.filter(l => l.farm_id === farmId && l.date === dateStr);
  };

  return (
    <div className="border rounded-lg overflow-auto bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[180px] sticky left-0 bg-muted/50 z-10">
              Farm
            </th>
            {days.map(day => (
              <th
                key={day.toISOString()}
                className={cn(
                  'text-center px-2 py-3 font-medium text-xs min-w-[120px]',
                  isToday(day) && 'bg-primary/10'
                )}
              >
                <div className="text-muted-foreground">{format(day, 'EEE')}</div>
                <div className={cn('text-lg font-bold', isToday(day) ? 'text-primary' : 'text-foreground')}>
                  {format(day, 'd')}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {farms.map((farm, idx) => (
            <tr key={farm.id} className={cn('border-b last:border-b-0', idx % 2 === 0 ? 'bg-background' : 'bg-muted/20')}>
              <td className={cn('px-4 py-2 font-medium text-sm sticky left-0 z-10', idx % 2 === 0 ? 'bg-background' : 'bg-muted/20')}>
                {farm.name}
              </td>
              {days.map(day => {
                const cellLoads = getLoadsForCell(farm.id, day);
                return (
                  <td
                    key={day.toISOString()}
                    className={cn(
                      'px-1 py-1 text-center border-l relative group',
                      isToday(day) && 'bg-primary/5'
                    )}
                  >
                    <div className="min-h-[40px] flex flex-col items-center justify-center gap-1">
                      {cellLoads.map(load => (
                        <button
                          key={load.id}
                          onClick={() => onClickLoad(load)}
                          className={cn(
                            'w-full rounded px-1.5 py-0.5 text-xs font-medium truncate transition-colors',
                            load.status === 'completed' ? 'bg-primary/20 text-primary' :
                            load.status === 'in_transit' ? 'bg-accent/20 text-accent' :
                            'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          )}
                        >
                          {load.load_count || 1} load{(load.load_count || 1) > 1 ? 's' : ''}
                          {load.notes ? ` - ${load.notes}` : ''}
                        </button>
                      ))}
                      {isAdmin && (
                        <button
                          onClick={() => onAddLoad(farm, day)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted text-muted-foreground"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
          {farms.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-12 text-muted-foreground">
                No farms found. Add farms in the Manage section.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
