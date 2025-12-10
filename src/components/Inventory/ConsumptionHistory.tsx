import React, { useState, useMemo } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import type { Bottle } from '../../types';
import { Card } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EditConsumptionModal } from './EditConsumptionModal';
import { Calendar, Wine as WineIcon, Search, Star, Edit2 } from 'lucide-react';
import clsx from 'clsx';

export const ConsumptionHistory: React.FC = () => {
    const bottles = useInventoryStore(state => state.bottles);
    const getWine = useInventoryStore(state => state.getWine);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [minRating, setMinRating] = useState<number | ''>('');
    const [startDate, setStartDate] = useState('');

    // Edit Modal
    const [editingBottle, setEditingBottle] = useState<Bottle | null>(null);

    // Derived Data
    const stockCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        bottles.forEach(b => {
            if (b.status === 'Stored') counts[b.wineId] = (counts[b.wineId] || 0) + 1;
        });
        return counts;
    }, [bottles]);

    const historyData = useMemo(() => {
        return bottles
            .filter(b => b.status === "Consumed")
            .map(b => ({
                bottle: b,
                wine: getWine(b.wineId),
                inStock: stockCounts[b.wineId] || 0
            }))
            .filter(item => item.wine) // Ensure wine exists
            .map(item => ({ ...item, wine: item.wine! }))
            .filter(({ wine, bottle }) => {
                const matchesSearch =
                    wine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    wine.producer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (wine.vineyard && wine.vineyard.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (bottle.consumptionNotes && bottle.consumptionNotes.toLowerCase().includes(searchTerm.toLowerCase()));

                const matchesRating = minRating === '' || (bottle.consumptionRating !== undefined && bottle.consumptionRating >= minRating);

                const matchesDate = !startDate || (bottle.dateConsumed && new Date(bottle.dateConsumed) >= new Date(startDate));

                return matchesSearch && matchesRating && matchesDate;
            })
            .sort((a, b) => new Date(b.bottle.dateConsumed || 0).getTime() - new Date(a.bottle.dateConsumed || 0).getTime());
    }, [bottles, getWine, searchTerm, minRating, startDate, stockCounts]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                    <WineIcon className="text-purple-400" />
                    Consumption Log
                </h1>

                {/* Filters Bar */}
                <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search wines or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Min Rating"
                            value={minRating}
                            onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : '')}
                            min="0" max="100"
                            className="w-24 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Wine</th>
                                <th className="px-6 py-4">Vintage</th>
                                <th className="px-6 py-4">In Stock</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4">Notes</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {historyData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No matching consumption records found.
                                    </td>
                                </tr>
                            ) : (
                                historyData.map(({ bottle, wine, inStock }) => (
                                    <tr key={bottle.id} className="hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-500" />
                                                {bottle.dateConsumed ? new Date(bottle.dateConsumed).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-200">{wine.producer}</div>
                                            {wine.vineyard && <div className="text-xs text-indigo-400">{wine.vineyard}</div>}
                                            <div className="text-slate-500">{wine.name}</div>
                                        </td>
                                        <td className="px-6 py-4">{wine.year}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2 py-1 rounded-full text-xs font-bold",
                                                inStock > 0 ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800" : "bg-slate-800 text-slate-500"
                                            )}>
                                                {inStock} Left
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {bottle.consumptionRating !== undefined ? (
                                                <span className="flex items-center text-yellow-500 font-bold">
                                                    <Star size={14} className="mr-1 fill-yellow-500" />
                                                    {bottle.consumptionRating}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={bottle.consumptionNotes}>
                                            {bottle.consumptionNotes || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setEditingBottle(bottle)}
                                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                                title="Edit Details"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={!!editingBottle} onClose={() => setEditingBottle(null)} title="Edit Consumption Details">
                {editingBottle && (
                    <EditConsumptionModal
                        bottle={editingBottle}
                        onSuccess={() => setEditingBottle(null)}
                        onCancel={() => setEditingBottle(null)}
                    />
                )}
            </Modal>
        </div>
    );
};
