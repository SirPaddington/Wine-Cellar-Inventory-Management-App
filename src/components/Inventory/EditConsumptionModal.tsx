import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { Button } from '../ui/Button';
import { Save } from 'lucide-react';
import type { Bottle } from '../../types';

interface EditConsumptionModalProps {
    bottle: Bottle;
    onSuccess: () => void;
    onCancel: () => void;
}

export const EditConsumptionModal: React.FC<EditConsumptionModalProps> = ({ bottle, onSuccess, onCancel }) => {
    const updateBottle = useInventoryStore((state) => state.updateBottle);
    const getWine = useInventoryStore((state) => state.getWine);

    const [dateConsumed, setDateConsumed] = useState(() => {
        if (!bottle.dateConsumed) return '';
        const d = new Date(bottle.dateConsumed);
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    });
    const [rating, setRating] = useState<number | ''>(bottle.consumptionRating !== undefined ? bottle.consumptionRating : '');
    const [notes, setNotes] = useState(bottle.consumptionNotes || '');

    const wine = getWine(bottle.wineId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateBottle(bottle.id, {
            dateConsumed: new Date(dateConsumed).toISOString(),
            consumptionRating: rating === '' ? undefined : Number(rating),
            consumptionNotes: notes
        });
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <p className="text-sm text-slate-400">Wine</p>
                <p className="font-medium text-slate-200">{wine?.producer} {wine?.name} ({wine?.year})</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Date Consumed</label>
                <input
                    type="date"
                    value={dateConsumed}
                    onChange={(e) => setDateConsumed(e.target.value)}
                    className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rating (0-100)</label>
                <input
                    type="number"
                    min="0" max="100"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">
                    <Save size={16} className="mr-2" />
                    Save Changes
                </Button>
            </div>
        </form>
    );
};
