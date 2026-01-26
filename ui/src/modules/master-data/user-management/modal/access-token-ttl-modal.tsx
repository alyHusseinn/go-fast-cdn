import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import configService from '@/services/configService';
import toast from 'react-hot-toast';

interface AccessTokenTTLModalProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const MIN_TTL = 5 ; // 5 minutes 
const MAX_TTL = 24 * 60; // 1 day in minutes

export default function AccessTokenTTLModal({ isOpen, setOpen }: AccessTokenTTLModalProps) {
  const [oldTTL, setOldTTL] = useState<number | null>(null);
  const [newTTL, setNewTTL] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      configService.getAccessTokenTTL()
        .then((ttl) => {
          setOldTTL(ttl);
          setNewTTL(ttl.toString());
        })
        .catch(() => setError('Failed to fetch current TTL'))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleSave = async () => {
    setError(null);
    const ttlNum = Number(newTTL);
    if (isNaN(ttlNum) || ttlNum < MIN_TTL || ttlNum > MAX_TTL) {
      setError('TTL must be between 5 minutes and 1 day (in minutes).');
      return;
    }
    setLoading(true);
    try {
      await configService.setAccessTokenTTL(ttlNum);
      toast.success('Access token TTL updated!');
      setOpen(false);
    } catch {
      setError('Failed to update TTL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Access Token TTL</DialogTitle>
          <DialogDescription>
            Set the access token time-to-live (TTL) in minutes. Allowed range: 5 minutes to 1 day (1440 minutes).
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Current TTL: <b>{oldTTL}</b> minutes</div>
            </div>
            <Input
              type="number"
              min={MIN_TTL}
              max={MAX_TTL}
              value={newTTL}
              onChange={e => setNewTTL(e.target.value)}
              placeholder="Enter new TTL in minutes"
              disabled={loading}
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !newTTL}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
