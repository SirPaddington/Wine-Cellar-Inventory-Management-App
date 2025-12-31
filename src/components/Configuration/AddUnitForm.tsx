import React, { useState } from 'react';
import { useCellarStore } from '../../store/cellarStore';
import type { StorageUnit, StorageUnitType } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AddUnitFormProps {
    locationId: string;
    initialData?: StorageUnit;
    onSuccess: () => void;
    onCancel: () => void;
}

export const AddUnitForm: React.FC<AddUnitFormProps> = ({ locationId, initialData, onSuccess, onCancel }) => {
    const addUnit = useCellarStore((state) => state.addUnit);
    const updateUnit = useCellarStore((state) => state.updateUnit);

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        type: initialData?.type || 'grid' as StorageUnitType,
        width: initialData?.dimensions.width || 8,
        height: initialData?.dimensions.height || 8,
        depth: initialData?.dimensions.depth || 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        const dimensions = {
            width: Number(formData.width),
            height: Number(formData.height),
            depth: Number(formData.depth),
        };

        if (initialData) {
            updateUnit(initialData.id, {
                locationId: initialData.locationId,
                name: formData.name,
                type: formData.type,
                dimensions,
            });
        } else {
            // Robust UUID generation
            const id = (typeof self.crypto !== 'undefined' && self.crypto.randomUUID)
                ? self.crypto.randomUUID()
                : `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            addUnit({
                id,
                locationId,
                name: formData.name,
                type: formData.type,
                dimensions,
            });
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Unit Name"
                id="unit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Top Rack"
                required
            />

            <div>
                <label htmlFor="unit-type" className="block text-lg font-medium text-slate-300 mb-1">Type</label>
                <select
                    id="unit-type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as StorageUnitType })}
                    className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500 text-lg px-3 py-2"
                >
                    <option value="grid">Grid (Standard Rack)</option>
                    <option value="list">List (Unstructured)</option>
                    <option value="crate">Case</option>
                    <option value="vertical_drawer">Vertical Drawer</option>
                </select>
            </div>

            {(formData.type === 'crate' || formData.type === 'vertical_drawer') && (
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <label className="block text-sm font-medium text-slate-400 mb-3">Size Preset</label>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, width: 4, height: 3, depth: 1 })}
                            className="flex-1 py-2 px-4 rounded-lg bg-slate-800 hover:bg-indigo-900/30 text-base text-slate-200 transition-all border border-slate-700 hover:border-indigo-500/50 shadow-sm"
                        >
                            <span className="block font-medium">Full Case</span>
                            <span className="text-sm text-slate-400">12 Bottles (4x3)</span>
                        </button>

                        <div className="h-8 w-px bg-slate-700 mx-2" />

                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, width: 3, height: 2, depth: 1 })}
                            className="flex-1 py-2 px-4 rounded-lg bg-slate-800 hover:bg-indigo-900/30 text-base text-slate-200 transition-all border border-slate-700 hover:border-indigo-500/50 shadow-sm"
                        >
                            <span className="block font-medium">Half Case</span>
                            <span className="text-sm text-slate-400">6 Bottles (3x2)</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                <Input
                    label="Columns (Width)"
                    type="number"
                    min="1"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 0 })}
                />
                <Input
                    label="Rows (Height)"
                    type="number"
                    min="1"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                />
                <Input
                    label="Depth"
                    type="number"
                    min="1"
                    value={formData.depth}
                    onChange={(e) => setFormData({ ...formData, depth: parseInt(e.target.value) || 0 })}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{initialData ? 'Save Changes' : 'Add Unit'}</Button>
            </div>
        </form>
    );
};
