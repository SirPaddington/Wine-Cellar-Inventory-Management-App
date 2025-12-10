import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useCellarStore } from '../../store/cellarStore';
import { Trash2, Edit2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { EditBottleLocationModal } from './EditBottleLocationModal';
import { EditConsumptionModal } from './EditConsumptionModal';
import type { Bottle } from '../../types';

interface BottleListProps {
    wineId: string;
}

export const BottleList: React.FC<BottleListProps> = ({ wineId }) => {
    const getBottlesByWine = useInventoryStore(state => state.getBottlesByWine);
    const bottles = getBottlesByWine(wineId) || [];
    const deleteBottle = useInventoryStore(state => state.deleteBottle);
    const locations = useCellarStore(state => state.locations);
    const units = useCellarStore(state => state.units);

    // Edit States
    const [editingLocationBottle, setEditingLocationBottle] = useState<Bottle | null>(null);
    const [editingConsumptionBottle, setEditingConsumptionBottle] = useState<Bottle | null>(null);

    const getLocationName = (locationId: string) => locations.find(l => l.id === locationId)?.name || 'Unknown';
    const getUnitName = (unitId: string) => units.find(u => u.id === unitId)?.name || 'Unknown';

    // Group by status
    const storedBottles = bottles.filter(b => b.status === "Stored");
    const consumedBottles = bottles.filter(b => b.status === "Consumed");

    const handleDelete = (bottleId: string) => {
        if (confirm("Are you sure you want to permanently delete this bottle record?")) {
            deleteBottle(bottleId);
        }
    };

    return (
        <div className="space-y-4 border-t border-slate-800 pt-4 mt-6">
            <h3 className="text-lg font-semibold text-slate-200">Bottle Management</h3>

            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Stored Bottles ({storedBottles.length})</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-800 rounded-lg p-2 bg-slate-950/50">
                        {storedBottles.length === 0 ? <p className="text-xs text-slate-500">No bottles in storage.</p> :
                            storedBottles.map(b => (
                                <div key={b.id} className="flex justify-between items-center text-sm p-3 bg-slate-900 rounded-lg border border-slate-800/50">
                                    <div className="text-slate-300">
                                        <div className="font-medium text-indigo-300">{getLocationName(b.locationId)}</div>
                                        <div className="text-slate-500 text-xs">{getUnitName(b.unitId)} (Col: {b.x + 1}, Row: {b.y + 1}, Depth: {b.depth + 1})</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingLocationBottle(b)}
                                            className="p-1.5 text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-md"
                                            title="Edit Location"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(b.id)}
                                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-slate-800 rounded-md"
                                            title="Delete Bottle"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Consumed Bottles ({consumedBottles.length})</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-800 rounded-lg p-2 bg-slate-950/50">
                        {consumedBottles.length === 0 ? <p className="text-xs text-slate-500">No bottles consumed.</p> :
                            consumedBottles.map(b => (
                                <div key={b.id} className="flex justify-between items-center text-sm p-3 bg-slate-900 rounded-lg border border-slate-800/50">
                                    <div className="text-slate-300">
                                        <div className="font-medium">{b.dateConsumed ? new Date(b.dateConsumed).toLocaleDateString() : 'Unknown Date'}</div>
                                        {b.consumptionRating && <div className="text-yellow-500 text-xs">★ {b.consumptionRating}</div>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingConsumptionBottle(b)}
                                            className="p-1.5 text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-md"
                                            title="Edit Consumption Details"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(b.id)}
                                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-slate-800 rounded-md"
                                            title="Delete Record"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={!!editingLocationBottle} onClose={() => setEditingLocationBottle(null)} title="Edit Bottle Location">
                {editingLocationBottle && (
                    <EditBottleLocationModal
                        bottle={editingLocationBottle}
                        onSuccess={() => setEditingLocationBottle(null)}
                        onCancel={() => setEditingLocationBottle(null)}
                    />
                )}
            </Modal>

            <Modal isOpen={!!editingConsumptionBottle} onClose={() => setEditingConsumptionBottle(null)} title="Edit Consumption Details">
                {editingConsumptionBottle && (
                    <EditConsumptionModal
                        bottle={editingConsumptionBottle}
                        onSuccess={() => setEditingConsumptionBottle(null)}
                        onCancel={() => setEditingConsumptionBottle(null)}
                    />
                )}
            </Modal>
        </div>
    );
};
