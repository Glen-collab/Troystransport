import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { store } from '@/lib/store';
import { getWeekStart, getPrevWeek, getNextWeek, toDateString } from '@/lib/weekUtils';
import WeekNavigator from '@/components/schedule/WeekNavigator';
import SpreadsheetGrid from '@/components/schedule/SpreadsheetGrid';
import FeedYardSelector from '@/components/schedule/FeedYardSelector';
import LoadDialog from '@/components/schedule/LoadDialog';
import { Badge } from '@/components/ui/badge';
import { Truck } from 'lucide-react';

export default function Schedule() {
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [selectedFeedYard, setSelectedFeedYard] = useState('all');

  const [feedYards, setFeedYards] = useState([]);
  const [allFarms, setAllFarms] = useState([]);
  const [loads, setLoads] = useState([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState(null);
  const [dialogFarm, setDialogFarm] = useState(null);
  const [dialogDate, setDialogDate] = useState(null);

  const weekStartStr = toDateString(weekStart);

  // Load data
  const loadData = () => {
    store.feedYards.list().then(setFeedYards);
    store.farms.list().then(setAllFarms);

    const filter = { week_start: weekStartStr };
    if (selectedFeedYard !== 'all') filter.feed_yard_id = selectedFeedYard;
    store.loads.filter(filter).then(setLoads);
  };

  useEffect(() => { loadData(); }, [weekStartStr, selectedFeedYard]);

  // Filter farms based on selected feed yard
  const farms = useMemo(() => {
    if (selectedFeedYard === 'all') return allFarms;
    return allFarms.filter(f => f.feed_yard_id === selectedFeedYard);
  }, [allFarms, selectedFeedYard]);

  // Stats
  const totalLoads = loads.reduce((sum, l) => sum + (l.load_count || 1), 0);
  const scheduledLoads = loads.filter(l => l.status === 'scheduled' || !l.status).length;

  const handleAddLoad = (farm, date) => {
    setEditingLoad(null);
    setDialogFarm(farm);
    setDialogDate(date);
    setDialogOpen(true);
  };

  const handleClickLoad = (load) => {
    const farm = allFarms.find(f => f.id === load.farm_id);
    setEditingLoad(load);
    setDialogFarm(farm);
    setDialogDate(new Date(load.date + 'T00:00:00'));
    setDialogOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingLoad) {
      await store.loads.update(editingLoad.id, formData);
    } else {
      await store.loads.create({
        ...formData,
        farm_id: dialogFarm.id,
        feed_yard_id: dialogFarm.feed_yard_id,
        date: toDateString(dialogDate),
        week_start: weekStartStr,
      });
    }
    setDialogOpen(false);
    loadData();
  };

  const handleDelete = async (id) => {
    await store.loads.delete(id);
    setDialogOpen(false);
    loadData();
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Truck load dispatch overview
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <FeedYardSelector
            feedYards={feedYards}
            selectedId={selectedFeedYard}
            onChange={setSelectedFeedYard}
            showAll={true}
          />
          <WeekNavigator
            weekStart={weekStart}
            onPrev={() => setWeekStart(getPrevWeek(weekStart))}
            onNext={() => setWeekStart(getNextWeek(weekStart))}
            onToday={() => setWeekStart(getWeekStart())}
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="gap-1.5 py-1 px-3 text-xs">
          <Truck className="w-3.5 h-3.5" />
          {totalLoads} total load{totalLoads !== 1 ? 's' : ''}
        </Badge>
        <Badge variant="outline" className="py-1 px-3 text-xs">
          {scheduledLoads} scheduled
        </Badge>
        {selectedFeedYard !== 'all' && (
          <Badge variant="outline" className="py-1 px-3 text-xs text-primary border-primary/30">
            {feedYards.find(fy => fy.id === selectedFeedYard)?.name || 'Feed Yard'}
          </Badge>
        )}
      </div>

      {/* Spreadsheet */}
      <SpreadsheetGrid
        weekStart={weekStart}
        farms={farms}
        loads={loads}
        isAdmin={true}
        onAddLoad={handleAddLoad}
        onClickLoad={handleClickLoad}
      />

      {/* Load Dialog */}
      <LoadDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        load={editingLoad}
        onSave={handleSave}
        onDelete={handleDelete}
        farmName={dialogFarm?.name || ''}
        dateLabel={dialogDate ? format(dialogDate, 'EEEE, MMM d') : ''}
      />
    </div>
  );
}
