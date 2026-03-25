import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

export default function LoadDialog({ open, onClose, load, onSave, onDelete, farmName, dateLabel }) {
  const [form, setForm] = useState({ load_count: 1, status: 'scheduled', notes: '' });

  useEffect(() => {
    if (load) {
      setForm({
        load_count: load.load_count || 1,
        status: load.status || 'scheduled',
        notes: load.notes || '',
      });
    } else {
      setForm({ load_count: 1, status: 'scheduled', notes: '' });
    }
  }, [load, open]);

  const handleSave = () => {
    onSave({
      load_count: parseInt(form.load_count) || 1,
      status: form.status,
      notes: form.notes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{load ? 'Edit Load' : 'Add Load'}</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-4">
          {farmName} &middot; {dateLabel}
        </div>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Number of Loads</Label>
            <Input
              type="number"
              min="1"
              value={form.load_count}
              onChange={e => setForm(f => ({ ...f, load_count: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Input
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes..."
            />
          </div>
        </div>
        <DialogFooter>
          {load && onDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(load.id)} className="mr-auto gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
