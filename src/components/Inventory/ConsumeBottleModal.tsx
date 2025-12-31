import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useCellarStore } from '../../store/cellarStore';
import { Button } from '../ui/Button';
import { Wine } from 'lucide-react';
import clsx from 'clsx';


interface ConsumeBottleModalProps {
    wineId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ConsumeBottleModal: React.FC<ConsumeBottleModalProps> = ({ wineId, onSuccess, onCancel }) => {
    // Fix: Select primitive data to prevent infinite re-render loops from unstable selector results
    const wine = useInventoryStore(state => state.wines.find(w => w.id === wineId));
    const allBottles = useInventoryStore(state => state.bottles);
    const bottles = allBottles.filter(b => b.wineId === wineId && b.status === "Stored");

    const updateBottle = useInventoryStore((state) => state.updateBottle);
    const locations = useCellarStore((state) => state.locations);
    const units = useCellarStore((state) => state.units);

    const [selectedBottleId, setSelectedBottleId] = useState<string | null>(null);
    const [rating, setRating] = useState<number | ''>('');
    const [notes, setNotes] = useState('');

    const getLocationName = (locationId: string) => locations.find(l => l.id === locationId)?.name || 'Unknown Location';
    const getUnitName = (unitId: string) => units.find(u => u.id === unitId)?.name || 'Unknown Unit';

    const handleConsume = () => {
        if (!selectedBottleId) return;

        updateBottle(selectedBottleId, {
            status: 'Consumed',
            dateConsumed: new Date().toISOString(),
            consumptionRating: rating === '' ? undefined : Number(rating),
            consumptionNotes: notes
        });
        onSuccess();
    };

    if (!wine) return null;

    return (
        <div className="space-y-4">
            <p className="text-slate-400">
                Select a bottle of <strong className="text-slate-200">{wine.producer} {wine.name}</strong> to mark as consumed.
            </p>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-2 border border-slate-800 rounded-lg p-2 bg-slate-950/50">
                {bottles.length === 0 ? (
                    <p className="text-lg text-yellow-500">No bottles currently in stock.</p>
                ) : (
                    bottles.map(bottle => (
                        <div
                            key={bottle.id}
                            onClick={() => setSelectedBottleId(bottle.id)}
                            className={clsx(
                                "p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors",
                                selectedBottleId === bottle.id
                                    ? "bg-indigo-900/40 border-indigo-500"
                                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                            )}
                        >
                            <div className="flex flex-col text-lg">
                                <span className="text-slate-200 font-medium">{getLocationName(bottle.locationId)}</span>
                                <span className="text-slate-500 text-base">{getUnitName(bottle.unitId)} — Slot {bottle.x},{bottle.y}</span>
                            </div>
                            <div className="text-sm text-slate-500">
                                Added {new Date(bottle.dateAdded).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="space-y-3 pt-2">
                <div>
                    <label className="block text-lg font-medium text-slate-300 mb-1">Consumption Rating (0-100)</label>
                    <input
                        type="number"
                        min="0" max="100"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500 text-lg px-3 py-2"
                        placeholder="Optional rating"
                    />
                </div>
                <div>
                    <label className="block text-lg font-medium text-slate-300 mb-1">Tasting Notes</label>
                    <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500 text-lg px-3 py-2"
                        placeholder="How was it?"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button
                    type="submit"
                    variant="primary" // Assuming primary is default indigo
                    disabled={!selectedBottleId}
                    onClick={handleConsume}
                >
                    <Wine size={16} className="mr-2" />
                    Drink Bottle
                </Button>
            </div>
        </div>
    );
};
