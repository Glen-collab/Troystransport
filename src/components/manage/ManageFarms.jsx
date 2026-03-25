import { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ManageFarms() {
  const [feedYards, setFeedYards] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedFeedYardId, setSelectedFeedYardId] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [farmName, setFarmName] = useState('');

  useEffect(() => {
    store.feedYards.list().then(data => {
      setFeedYards(data);
      if (data.length > 0) setSelectedFeedYardId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedFeedYardId) {
      store.farms.filter({ feed_yard_id: selectedFeedYardId }, 'sort_order').then(setFarms);
    }
  }, [selectedFeedYardId]);

  const reload = () =>
    store.farms.filter({ feed_yard_id: selectedFeedYardId }, 'sort_order').then(setFarms);

  const handleAdd = async () => {
    if (!farmName.trim()) return;
    await store.farms.create({
      name: farmName.trim(),
      feed_yard_id: selectedFeedYardId,
      sort_order: farms.length + 1,
    });
    setFarmName('');
    setAdding(false);
    reload();
  };

  const handleEdit = async (id) => {
    if (!farmName.trim()) return;
    await store.farms.update(id, { name: farmName.trim() });
    setEditingId(null);
    setFarmName('');
    reload();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this farm?')) return;
    await store.farms.delete(id);
    reload();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <Select value={selectedFeedYardId} onValueChange={setSelectedFeedYardId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select feed yard" />
          </SelectTrigger>
          <SelectContent>
            {feedYards.map(fy => (
              <SelectItem key={fy.id} value={fy.id}>{fy.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5 ml-auto">
          <Plus className="w-3.5 h-3.5" /> Add Farm
        </Button>
      </div>

      {adding && (
        <div className="flex gap-2">
          <Input
            placeholder="Farm name"
            value={farmName}
            onChange={e => setFarmName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <Button size="sm" onClick={handleAdd}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
        </div>
      )}

      <div className="space-y-2">
        {farms.map((farm, idx) => (
          <Card key={farm.id}>
            <CardContent className="py-3 flex items-center justify-between">
              {editingId === farm.id ? (
                <div className="flex gap-2 flex-1">
                  <Input
                    value={farmName}
                    onChange={e => setFarmName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleEdit(farm.id)}
                    autoFocus
                  />
                  <Button size="sm" onClick={() => handleEdit(farm.id)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                    <span className="font-medium">{farm.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditingId(farm.id); setFarmName(farm.name); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(farm.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
        {farms.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground text-center py-8">No farms yet for this feed yard.</p>
        )}
      </div>
    </div>
  );
}
