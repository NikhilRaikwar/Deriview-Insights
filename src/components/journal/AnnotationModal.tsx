import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trade } from '@/lib/types';
import { useState } from 'react';

const TAG_OPTIONS = ['planned', 'system', 'FOMO', 'news', 'mistake'];

interface Props {
  trade: Trade;
  onClose: () => void;
}

export default function AnnotationModal({ trade, onClose }: Props) {
  const [notes, setNotes] = useState(trade.notes || '');
  const [tags, setTags] = useState<string[]>(trade.tags || []);

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Annotate — {trade.symbol}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Trade notes..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="min-h-[100px] text-sm"
          />
          <div>
            <p className="text-xs text-muted-foreground mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map(tag => (
                <Badge
                  key={tag}
                  variant={tags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={onClose}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
