"use client"
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import type { Customer } from '@/types';

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (customer: Omit<Customer, 'id' | 'created_at'>) => Promise<Customer | null>;
  businessId: string;
}

export function AddCustomerModal({ open, onClose, onAdd, businessId }: AddCustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await onAdd({
      business_id: businessId,
      name,
      phone: phone || null,
      email: email || null,
      visit_date: new Date().toISOString(),
      tags: [],
      source: 'manual',
    });
    setLoading(false);
    if (result) {
      setName('');
      setPhone('');
      setEmail('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="name">Nom complet *</Label>
            <Input id="name" placeholder="Marie Dupont" value={name} onChange={e => setName(e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="phone">Telephone</Label>
            <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="marie@exemple.fr" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="gradient" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ajouter le client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
