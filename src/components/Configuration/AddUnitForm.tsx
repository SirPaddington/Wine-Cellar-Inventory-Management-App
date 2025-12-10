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
            addUnit({
                id: self.crypto.randomUUID(),
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
                <label htmlFor="unit-type" className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select
                    id="unit-type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as StorageUnitType })}
                    className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                >
                    <option value="grid">Grid (Standard Rack)</option>
                    <option value="list">List (Unstructured)</option>
                    <option value="vertical_drawer">Vertical Drawer/Crate</option>
                </select>
            </div>

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
