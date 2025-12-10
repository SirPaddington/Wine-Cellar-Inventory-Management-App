
import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useCellarStore } from '../../store/cellarStore';
import { Button } from '../ui/Button';
import { Save } from 'lucide-react';
import type { Bottle } from '../../types';

interface EditBottleLocationModalProps {
    bottle: Bottle;
    onSuccess: () => void;
    onCancel: () => void;
}

export const EditBottleLocationModal: React.FC<EditBottleLocationModalProps> = ({ bottle, onSuccess, onCancel }) => {
    const updateBottle = useInventoryStore((state) => state.updateBottle);
    const locations = useCellarStore((state) => state.locations);
    const units = useCellarStore((state) => state.units);
    const getWine = useInventoryStore((state) => state.getWine);

    const wine = getWine(bottle.wineId);

    const [selectedLocationId, setSelectedLocationId] = useState(bottle.locationId);
    const [selectedUnitId, setSelectedUnitId] = useState(bottle.unitId);
    // For simplicity, we might just keep X/Y as is unless unit changes? 
    // Or simpler: Just Location/Unit for now, and warn if position is invalid?
    // Or better: Let's assume we are just fixing data.
    // If unit changes, x/y might be invalid.
    // Let's provide x/y inputs?
    const [x, setX] = useState(bottle.x);
    const [y, setY] = useState(bottle.y);

    // Filter units by location
    const filteredUnits = units.filter(u => u.locationId === selectedLocationId);

    // Initial unit selection sync
    useEffect(() => {
        if (!filteredUnits.find(u => u.id === selectedUnitId)) {
            setSelectedUnitId(filteredUnits[0]?.id || '');
        }
    }, [selectedLocationId, filteredUnits, selectedUnitId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateBottle(bottle.id, {
            locationId: selectedLocationId,
            unitId: selectedUnitId,
            x: Number(x),
            y: Number(y)
        });
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <p className="text-sm text-slate-400">Wine</p>
                <p className="font-medium text-slate-200">{wine?.producer} {wine?.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                    <select
                        value={selectedLocationId}
                        onChange={(e) => setSelectedLocationId(e.target.value)}
                        className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 text-sm"
                    >
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Storage Unit</label>
                    <select
                        value={selectedUnitId}
                        onChange={(e) => setSelectedUnitId(e.target.value)}
                        className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 text-sm"
                    >
                        <option value="">Select Unit</option>
                        {filteredUnits.length === 0 ? <option disabled>No units</option> :
                            filteredUnits.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Column (X)</label>
                    <input
                        type="number"
                        min="0"
                        value={x}
                        onChange={(e) => setX(Number(e.target.value))}
                        className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Row (Y)</label>
                    <input
                        type="number"
                        min="0"
                        value={y}
                        onChange={(e) => setY(Number(e.target.value))}
                        className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 text-sm"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">
                    <Save size={16} className="mr-2" />
                    Save Position
                </Button>
            </div>
        </form>
    );
};
