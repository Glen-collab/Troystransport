import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format, isToday } from 'date-fns';
import { store } from '@/lib/store';
import { getWeekStart, getPrevWeek, getNextWeek, toDateString, getWeekDays } from '@/lib/weekUtils';
import WeekNavigator from '@/components/schedule/WeekNavigator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Truck, MapPin } from 'lucide-react';

export default function FarmerView() {
  const { farmId } = useParams();
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [farm, setFarm] = useState(null);
  const [feedYard, setFeedYard] = useState(null);
  const [loads, setLoads] = useState([]);
  const [notFound, setNotFound] = useState(false);

  const weekStartStr = toDateString(weekStart);
  const days = getWeekDays(weekStart);

  useEffect(() => {
    store.farms.list().then(farms => {
      const found = farms.find(f => f.id === farmId);
      if (found) {
        setFarm(found);
        store.feedYards.list().then(fys => {
          setFeedYard(fys.find(fy => fy.id === found.feed_yard_id) || null);
        });
      } else {
        setNotFound(true);
      }
    });
  }, [farmId]);

  useEffect(() => {
    if (!farm) return;
    store.loads.filter({ farm_id: farm.id, week_start: weekStartStr }).then(setLoads);
  }, [farm, weekStartStr]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Truck className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-bold">Farm Not Found</h1>
          <p className="text-sm text-muted-foreground">This link doesn't match any farm in the system.</p>
        </div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const totalLoads = loads.reduce((sum, l) => sum + (l.load_count || 1), 0);
  const getLoadsForDay = (date) => loads.filter(l => l.date === toDateString(date));

  const statusLabel = (status) => {
    switch (status) {
      case 'in_transit': return 'In Transit';
      case 'completed': return 'Completed';
      default: return 'Scheduled';
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'in_transit': return 'bg-accent/20 text-accent border-accent/30';
      case 'completed': return 'bg-primary/20 text-primary border-primary/30';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-sidebar text-sidebar-foreground">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Truck className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-sidebar-foreground/60">Oshkosh Heifer Dispatch</p>
              <h1 className="text-xl font-bold">{farm.name}</h1>
            </div>
          </div>
          {feedYard && feedYard.location && (
            <div className="flex items-center gap-1.5 text-xs text-sidebar-foreground/50 mt-2 ml-[52px]">
              <MapPin className="w-3 h-3" />
              {feedYard.name} &middot; {feedYard.location}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Nav + Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-xs">
              <Truck className="w-3.5 h-3.5" />
              {totalLoads} load{totalLoads !== 1 ? 's' : ''} this week
            </Badge>
          </div>
          <WeekNavigator
            weekStart={weekStart}
            onPrev={() => setWeekStart(getPrevWeek(weekStart))}
            onNext={() => setWeekStart(getNextWeek(weekStart))}
            onToday={() => setWeekStart(getWeekStart())}
          />
        </div>

        {/* Week of label */}
        <h2 className="text-lg font-semibold">
          Week of {format(weekStart, 'MMMM d')}
        </h2>

        {/* Day cards */}
        <div className="grid gap-3">
          {days.map(day => {
            const dayLoads = getLoadsForDay(day);
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'rounded-lg border p-4 transition-colors',
                  today ? 'border-primary/40 bg-primary/5' : 'bg-card',
                  dayLoads.length === 0 && !today && 'opacity-60'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-semibold',
                      today && 'text-primary'
                    )}>
                      {format(day, 'EEEE')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(day, 'MMM d')}
                    </span>
                    {today && (
                      <Badge variant="default" className="text-[10px] py-0 px-1.5">Today</Badge>
                    )}
                  </div>
                  {dayLoads.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {dayLoads.reduce((s, l) => s + (l.load_count || 1), 0)} load{dayLoads.reduce((s, l) => s + (l.load_count || 1), 0) !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {dayLoads.length > 0 ? (
                  <div className="space-y-2">
                    {dayLoads.map(load => (
                      <div
                        key={load.id}
                        className={cn(
                          'rounded-md border px-3 py-2 text-sm flex items-center justify-between',
                          statusColor(load.status)
                        )}
                      >
                        <div>
                          <span className="font-medium">
                            {load.load_count || 1} load{(load.load_count || 1) > 1 ? 's' : ''}
                          </span>
                          {load.notes && (
                            <span className="ml-2 opacity-75">— {load.notes}</span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] py-0">
                          {statusLabel(load.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No loads scheduled</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          Oshkosh Heifer Dispatch System &middot; Contact your dispatcher for changes
        </div>
      </div>
    </div>
  );
}
