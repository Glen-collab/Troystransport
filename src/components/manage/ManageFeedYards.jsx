import { useState, useEffect } from 'react';
import { store } from '@/lib/store';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function ManageFeedYards() {
  const [feedYards, setFeedYards] = useState([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', contact_name: '', phone: '', location: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await store.feedYards.list();
    setFeedYards(data);
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    await store.feedYards.create(form);
    setForm({ name: '', contact_name: '', phone: '', location: '' });
    setAdding(false);
    load();
  };

  const handleEdit = async (id) => {
    await store.feedYards.update(id, form);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feed yard? All farms and loads linked to it will be orphaned.')) return;
    await store.feedYards.delete(id);
    load();
  };

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Feed Yards</h3>
        <Button size="sm" onClick={() => setAdding(true)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Feed Yard
        </Button>
      </div>

      {adding && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Feed Yard Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Contact Name" value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} />
              <Input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              <Input placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {feedYards.map(fy => (
          <Card key={fy.id}>
            <CardContent className="pt-4">
              {editingId === fy.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    <Input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} />
                    <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(fy.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{fy.name}</p>
                    <p className="text-xs text-muted-foreground">{[fy.contact_name, fy.phone, fy.location].filter(Boolean).join(' \u00b7 ')}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditingId(fy.id); setForm({ name: fy.name, contact_name: fy.contact_name || '', phone: fy.phone || '', location: fy.location || '' }); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(fy.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {feedYards.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground text-center py-8">No feed yards yet. Add your first one.</p>
        )}
      </div>
    </div>
  );
}
