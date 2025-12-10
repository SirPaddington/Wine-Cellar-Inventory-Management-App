import React, { useState } from 'react';
import { useCellarStore } from '../../store/cellarStore';
import type { Location } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AddLocationFormProps {
    initialData?: Location;
    onSuccess: () => void;
    onCancel: () => void;
}

export const AddLocationForm: React.FC<AddLocationFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const addLocation = useCellarStore((state) => state.addLocation);
    const updateLocation = useCellarStore((state) => state.updateLocation);

    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (initialData) {
            updateLocation(initialData.id, {
                name,
                description
            });
        } else {
            addLocation({
                id: self.crypto.randomUUID(),
                name,
                description,
            });
        }
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Location Name"
                id="location-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vacation Home"
                required
            />
            <div>
                <label htmlFor="location-desc" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                    id="location-desc"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    placeholder="Optional description..."
                />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{initialData ? 'Save Changes' : 'Add Location'}</Button>
            </div>
        </form>
    );
};
