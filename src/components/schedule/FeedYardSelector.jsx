import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FeedYardSelector({ feedYards, selectedId, onChange, showAll }) {
  return (
    <Select value={selectedId} onValueChange={onChange}>
      <SelectTrigger className="w-48 h-8 text-xs">
        <SelectValue placeholder="Select Feed Yard" />
      </SelectTrigger>
      <SelectContent>
        {showAll && <SelectItem value="all">All Feed Yards</SelectItem>}
        {feedYards.map(fy => (
          <SelectItem key={fy.id} value={fy.id}>{fy.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
