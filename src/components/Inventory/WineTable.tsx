import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';

import { Edit2, Trash2, Plus, Wine as WineIcon, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
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

    // Sorting State
    type SortKey = 'producer' | 'name' | 'year' | 'type' | 'region' | 'stock';
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: SortKey) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    // Helper to count bottles per wine
    const getBottleCount = (wineId: string) => bottles.filter(b => b.wineId === wineId && b.status === 'Stored').length;

    const filteredWines = wines.filter(w =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.producer.toLowerCase().includes(search.toLowerCase()) ||
        w.type.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
        if (!sortConfig) return 0;

        const { key, direction } = sortConfig;
        let comparison = 0;

        switch (key) {
            case 'year':
                comparison = a.year - b.year;
                break;
            case 'stock':
                comparison = getBottleCount(a.id) - getBottleCount(b.id);
                break;
            case 'producer':
                comparison = a.producer.localeCompare(b.producer);
                break;
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'type':
                comparison = a.type.localeCompare(b.type);
                break;
            case 'region':
                comparison = a.region.localeCompare(b.region);
                break;
            default:
                comparison = 0;
        }

        return direction === 'asc' ? comparison : -comparison;
    });

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex-none flex justify-between items-center bg-slate-900/95 backdrop-blur-sm p-4 rounded-xl border border-slate-800 shadow-lg z-20">
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
            <Modal isOpen={!!stockingWineId} onClose={() => setStockingWineId(null)} title="Add Bottles to Inventory" size="lg">
                {stockingWineId && (
                    <AddStockForm
                        wineId={stockingWineId!}
                        onSuccess={() => setStockingWineId(null)}
                        onCancel={() => setStockingWineId(null)}
                    />
                )}
            </Modal>


            {/* Consume Bottle Modal */}
            <Modal isOpen={!!consumingWineId} onClose={() => setConsumingWineId(null)} title="Drink Wine" size="lg">
                {consumingWineId && (
                    <ConsumeBottleModal
                        wineId={consumingWineId!}
                        onSuccess={() => setConsumingWineId(null)}
                        onCancel={() => setConsumingWineId(null)}
                    />
                )}
            </Modal>

            {/* View Bottles Modal */}
            <Modal isOpen={!!viewingBottlesWineId} onClose={() => setViewingBottlesWineId(null)} title="Stored Bottles" size="lg">
                {viewingBottlesWineId && <BottleList wineId={viewingBottlesWineId} />}
            </Modal>

            <Card className="flex-1 overflow-hidden flex flex-col min-h-0 bg-slate-900 border border-slate-800 rounded-xl shadow-sm">
                {/* Fixed Header Row */}
                <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_1fr_140px] gap-4 px-6 py-4 bg-slate-950 text-slate-200 uppercase font-medium border-b border-slate-800 text-sm">
                    <div className="cursor-pointer hover:text-white transition-colors group flex items-center gap-2" onClick={() => handleSort('producer')}>
                        Winery
                        {sortConfig?.key === 'producer' ? (
                            sortConfig?.direction === 'asc' ? <ArrowUp size={14} className="text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-400" />
                        ) : <ArrowUpDown size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                    <div className="cursor-pointer hover:text-white transition-colors group flex items-center gap-2" onClick={() => handleSort('name')}>
                        Varietal
                        {sortConfig?.key === 'name' ? (
                            sortConfig?.direction === 'asc' ? <ArrowUp size={14} className="text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-400" />
                        ) : <ArrowUpDown size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                    <div className="cursor-pointer hover:text-white transition-colors group flex items-center gap-2" onClick={() => handleSort('year')}>
                        Vintage
                        {sortConfig?.key === 'year' ? (
                            sortConfig?.direction === 'asc' ? <ArrowUp size={14} className="text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-400" />
                        ) : <ArrowUpDown size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                    <div className="cursor-pointer hover:text-white transition-colors group flex items-center gap-2" onClick={() => handleSort('type')}>
                        Type
                        {sortConfig?.key === 'type' ? (
                            sortConfig?.direction === 'asc' ? <ArrowUp size={14} className="text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-400" />
                        ) : <ArrowUpDown size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                    <div className="cursor-pointer hover:text-white transition-colors group flex items-center gap-2" onClick={() => handleSort('region')}>
                        Region
                        {sortConfig?.key === 'region' ? (
                            sortConfig?.direction === 'asc' ? <ArrowUp size={14} className="text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-400" />
                        ) : <ArrowUpDown size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                    <div className="text-center cursor-pointer hover:text-white transition-colors group flex items-center justify-center gap-2" onClick={() => handleSort('stock')}>
                        In Stock
                        {sortConfig?.key === 'stock' ? (
                            sortConfig?.direction === 'asc' ? <ArrowUp size={14} className="text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-400" />
                        ) : <ArrowUpDown size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                    <div className="text-right">Actions</div>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-auto flex-1">
                    {filteredWines.length === 0 ? (
                        <div className="px-6 py-12 text-center text-slate-500">
                            No wines found. Add your first bottle!
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {filteredWines.map((wine) => (
                                <div key={wine.id} className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1.5fr_1fr_140px] gap-4 px-6 py-4 items-center hover:bg-slate-800/50 transition-colors text-sm">
                                    <div className="font-medium text-slate-100 truncate">
                                        <div>{wine.producer}</div>
                                        {wine.vineyard && <div className="text-xs text-indigo-400 font-normal truncate">{wine.vineyard}</div>}
                                    </div>
                                    <div className="text-slate-300 truncate">
                                        {wine.name}
                                    </div>
                                    <div className="truncate">{wine.year}</div>
                                    <div className="truncate">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                            {wine.type}
                                        </span>
                                    </div>
                                    <div className="truncate">{wine.region}, {wine.country}</div>
                                    <div className="text-center">
                                        <button
                                            onClick={() => setViewingBottlesWineId(wine.id)}
                                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-indigo-400 font-bold hover:bg-slate-700 hover:text-indigo-300 transition-colors"
                                            title="View/Edit Bottles"
                                        >
                                            {getBottleCount(wine.id)}
                                        </button>
                                    </div>

                                    <div className="text-right">
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};
