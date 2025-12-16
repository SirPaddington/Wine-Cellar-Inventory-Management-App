import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';

import { Edit2, Trash2, Plus, Wine as WineIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { AddWineForm } from './AddWineForm';
import { AddStockForm } from './AddStockForm';
import { ConsumeBottleModal } from './ConsumeBottleModal';
import { BottleList } from './BottleList';
import type { Wine } from '../../types';

export const WineTable: React.FC = () => {
    const wines = useInventoryStore((state) => state.wines);
    const bottles = useInventoryStore((state) => state.bottles);
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // New States for Actions
    const [editingWine, setEditingWine] = useState<Wine | null>(null);
    const [stockingWineId, setStockingWineId] = useState<string | null>(null);
    const [consumingWineId, setConsumingWineId] = useState<string | null>(null);
    const [viewingBottlesWineId, setViewingBottlesWineId] = useState<string | null>(null);

    // Helper to count bottles per wine
    const getBottleCount = (wineId: string) => bottles.filter(b => b.wineId === wineId && b.status === 'Stored').length;

    const filteredWines = wines.filter(w =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.producer.toLowerCase().includes(search.toLowerCase()) ||
        w.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="w-72">
                    <Input
                        placeholder="Search wines..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={16} className="mr-2" />
                    Add Wine
                </Button>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Wine" size="lg">
                <AddWineForm onSuccess={() => setIsAddModalOpen(false)} onCancel={() => setIsAddModalOpen(false)} />
            </Modal>

            {/* Edit Wine Modal */}
            <Modal isOpen={!!editingWine} onClose={() => setEditingWine(null)} title="Edit Wine" size="lg">
                {editingWine && (
                    <AddWineForm
                        initialData={editingWine}
                        onSuccess={() => setEditingWine(null)}
                        onCancel={() => setEditingWine(null)}
                    />
                )}
            </Modal>

            {/* Add Stock Modal */}
            <Modal isOpen={!!stockingWineId} onClose={() => setStockingWineId(null)} title="Add Bottles to Inventory">
                {stockingWineId && (
                    <AddStockForm
                        wineId={stockingWineId}
                        onSuccess={() => setStockingWineId(null)}
                        onCancel={() => setStockingWineId(null)}
                    />
                )}
            </Modal>


            {/* Consume Bottle Modal */}
            <Modal isOpen={!!consumingWineId} onClose={() => setConsumingWineId(null)} title="Drink Wine">
                {consumingWineId && (
                    <ConsumeBottleModal
                        wineId={consumingWineId}
                        onSuccess={() => setConsumingWineId(null)}
                        onCancel={() => setConsumingWineId(null)}
                    />
                )}
            </Modal>

            {/* View Bottles Modal */}
            <Modal isOpen={!!viewingBottlesWineId} onClose={() => setViewingBottlesWineId(null)} title="Stored Bottles" size="lg">
                {viewingBottlesWineId && <BottleList wineId={viewingBottlesWineId} />}
            </Modal>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Winery</th>
                                <th className="px-6 py-4">Varietal</th>
                                <th className="px-6 py-4">Vintage</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Region</th>
                                <th className="px-6 py-4 text-center">In Stock</th>

                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredWines.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                        No wines found. Add your first bottle!
                                    </td>
                                </tr>
                            ) : (
                                filteredWines.map((wine) => (
                                    <tr key={wine.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-100">
                                            <div>{wine.producer}</div>
                                            {wine.vineyard && <div className="text-xs text-indigo-400 font-normal">{wine.vineyard}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {wine.name}
                                        </td>
                                        <td className="px-6 py-4">{wine.year}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                                {wine.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{wine.region}, {wine.country}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setViewingBottlesWineId(wine.id)}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-indigo-400 font-bold hover:bg-slate-700 hover:text-indigo-300 transition-colors"
                                                title="View/Edit Bottles"
                                            >
                                                {getBottleCount(wine.id)}
                                            </button>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="secondary" onClick={() => setStockingWineId(wine.id)} title="Add Stock">
                                                    <Plus size={14} className="mr-1" /> Add
                                                </Button>
                                                <button className="p-2 text-slate-400 hover:text-purple-400 transition-colors" onClick={() => setConsumingWineId(wine.id)} title="Consume Bottle">
                                                    <WineIcon size={16} className="rotate-12" />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setEditingWine(wine)}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
