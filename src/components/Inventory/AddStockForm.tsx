import React, { useState, useMemo } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useCellarStore } from '../../store/cellarStore';
import type { Bottle, StorageUnit } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AddStockFormProps {
    wineId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const AddStockForm: React.FC<AddStockFormProps> = ({ wineId, onSuccess, onCancel }) => {
    const locations = useCellarStore(state => state.locations);
    const units = useCellarStore(state => state.units);
    const existingBottles = useInventoryStore(state => state.bottles);
    const addBottles = useInventoryStore(state => state.addBottles);

    const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0]?.id || '');
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);

    // Filter units by location
    const availableUnits = useMemo(() =>
        units.filter(u => u.locationId === selectedLocationId),
        [selectedLocationId, units]);

    // Auto-select first unit when location changes
    React.useEffect(() => {
        if (availableUnits.length > 0 && !selectedUnitId) {
            setSelectedUnitId(availableUnits[0].id);
        } else if (availableUnits.length === 0) {
            setSelectedUnitId('');
        }
    }, [availableUnits, selectedUnitId]);

    const findEmptySlots = (unit: StorageUnit, count: number): { x: number, y: number, depth: number }[] => {
        // Simple slot finder: naive iteration xyz
        // In valid implementation we should start filling from bottom-left-back or similar preference.
        // Let's sweep: y (rows) -> x (cols) -> depth

        const slots: { x: number, y: number, depth: number }[] = [];
        const unitBottles = existingBottles.filter(b => b.unitId === unit.id && b.status === 'Stored');

        // Create a fast lookup for occupied slots
        const occupied = new Set<string>();
        unitBottles.forEach(b => occupied.add(`${b.x}-${b.y}-${b.depth}`));

        // Iterate
        for (let y = 0; y < unit.dimensions.height; y++) {
            for (let x = 0; x < unit.dimensions.width; x++) {
                // Check custom depth map if exists, else max depth
                let maxDepth = unit.dimensions.depth;
                // Locker specific logic support (naive check for now, can be expanded)
                if (unit.config?.customDepthMap && unit.config.customDepthMap[`${y}-${x}`]) {
                    maxDepth = unit.config.customDepthMap[`${y}-${x}`];
                }

                for (let d = 0; d < maxDepth; d++) {
                    if (!occupied.has(`${x}-${y}-${d}`)) {
                        slots.push({ x, y, depth: d });
                        if (slots.length >= count) return slots;
                    }
                }
            }
        }
        return slots;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedUnitId) {
            setError("Please select a storage unit.");
            return;
        }

        const unit = units.find(u => u.id === selectedUnitId);
        if (!unit) return;

        const emptySlots = findEmptySlots(unit, quantity);

        if (emptySlots.length < quantity) {
            setError(`Not enough space in ${unit.name}. Only ${emptySlots.length} slots available.`);
            return;
        }

        // Create bottles
        const newBottles: Bottle[] = emptySlots.map(slot => ({
            id: self.crypto.randomUUID(),
            wineId,
            locationId: selectedLocationId,
            unitId: selectedUnitId,
            x: slot.x,
            y: slot.y,
            depth: slot.depth,
            status: 'Stored',
            dateAdded: new Date().toISOString(),
        }));

        addBottles(newBottles);
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                <select
                    className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    value={selectedLocationId}
                    onChange={(e) => { setSelectedLocationId(e.target.value); setSelectedUnitId(''); }}
                >
                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Storage Unit</label>
                <select
                    className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    disabled={!selectedLocationId}
                >
                    {availableUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
            </div>

            <Input
                label="Quantity (Bottles)"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />

            {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">
                    Add {quantity} Bottle{quantity > 1 ? 's' : ''}
                </Button>
            </div>
        </form>
    );
};
