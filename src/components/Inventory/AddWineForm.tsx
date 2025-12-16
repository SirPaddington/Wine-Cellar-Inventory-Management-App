import React, { useState, useMemo, useEffect } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useCellarStore } from '../../store/cellarStore';
import { BottleList } from './BottleList';
import type { Wine, WineType, StorageUnit, Bottle } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Plus } from 'lucide-react';

interface AddWineFormProps {
    initialData?: Wine;
    onSuccess: () => void;
    onCancel: () => void;
}

export const AddWineForm: React.FC<AddWineFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const addWine = useInventoryStore((state) => state.addWine);
    const updateWine = useInventoryStore((state) => state.updateWine);

    // For Stock Logic
    const addBottles = useInventoryStore(state => state.addBottles);
    const existingBottles = useInventoryStore(state => state.bottles);
    const locations = useCellarStore(state => state.locations);
    const units = useCellarStore(state => state.units);

    // Wine Form State
    const [formData, setFormData] = useState<Partial<Wine>>(
        initialData || {
            producer: '',
            vineyard: '',
            name: '',
            year: new Date().getFullYear(),
            type: 'Red',
            country: '',
            region: '',
            rating: 0,
            description: '',
        });

    // Stock Form State (Only for new wines)
    const [addStock, setAddStock] = useState(false);
    const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0]?.id || '');
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [stockError, setStockError] = useState<string | null>(null);

    const wineTypes: WineType[] = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified'];

    // Filter units
    const availableUnits = useMemo(() =>
        units.filter(u => u.locationId === selectedLocationId),
        [selectedLocationId, units]);

    // Auto-select unit
    useEffect(() => {
        if (!initialData && addStock) {
            if (availableUnits.length > 0 && !selectedUnitId) {
                setSelectedUnitId(availableUnits[0].id);
            }
        }
    }, [availableUnits, selectedUnitId, initialData, addStock]);


    const findEmptySlots = (unit: StorageUnit, count: number): { x: number, y: number, depth: number }[] => {
        const slots: { x: number, y: number, depth: number }[] = [];
        const unitBottles = existingBottles.filter(b => b.unitId === unit.id && b.status === 'Stored');
        const occupied = new Set<string>();
        unitBottles.forEach(b => occupied.add(`${b.x}-${b.y}-${b.depth}`));

        for (let y = 0; y < unit.dimensions.height; y++) {
            for (let x = 0; x < unit.dimensions.width; x++) {
                let maxDepth = unit.dimensions.depth;
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
        setStockError(null);
        if (!formData.producer || !formData.name) return;

        // Helper: Extract varietals from the name input
        const varietalList = formData.name.split(',').map(v => v.trim()).filter(v => v.length > 0);

        if (initialData) {
            updateWine(initialData.id, {
                ...formData,
                varietal: varietalList
            });
            onSuccess();
        } else {
            // New Wine
            // Safe ID generation
            const id = (typeof self.crypto !== 'undefined' && self.crypto.randomUUID)
                ? self.crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

            // Validate Stock if checked
            let newBottles: Bottle[] = [];
            if (addStock && quantity > 0) {
                if (!selectedUnitId) {
                    setStockError("Please select a storage unit.");
                    return;
                }
                const unit = units.find(u => u.id === selectedUnitId);
                if (!unit) {
                    setStockError("Invalid unit.");
                    return;
                }
                const emptySlots = findEmptySlots(unit, quantity);
                if (emptySlots.length < quantity) {
                    setStockError(`Not enough space in ${unit.name}. Only ${emptySlots.length} slots available.`);
                    return;
                }

                newBottles = emptySlots.map(slot => ({
                    id: (typeof self.crypto !== 'undefined' && self.crypto.randomUUID) ? self.crypto.randomUUID() : `b-${Date.now()}-${Math.random()}`,
                    wineId: id,
                    locationId: selectedLocationId,
                    unitId: selectedUnitId,
                    x: slot.x,
                    y: slot.y,
                    depth: slot.depth,
                    status: 'Stored',
                    dateAdded: new Date().toISOString(),
                }));
            }

            // Execute
            addWine({
                id,
                producer: formData.producer!,
                vineyard: formData.vineyard || '',
                name: formData.name!,
                year: Number(formData.year),
                type: formData.type as WineType,
                varietal: varietalList,
                country: formData.country || 'Unknown',
                region: formData.region || 'Unknown',
                rating: Number(formData.rating),
                description: formData.description || '',
            } as Wine);

            if (newBottles.length > 0) {
                addBottles(newBottles);
            }

            onSuccess();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Producer"
                        id="producer"
                        name="producer"
                        value={formData.producer || ''}
                        onChange={handleChange}
                        placeholder="e.g. Mondavi"
                        required
                    />
                    <Input
                        label="Vineyard"
                        id="vineyard"
                        name="vineyard"
                        value={formData.vineyard || ''}
                        onChange={handleChange}
                        placeholder="e.g. To Kalon"
                    />
                </div>

                <Input
                    label="Varietal(s)"
                    id="name"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="e.g. Cabernet Sauvignon, Merlot"
                    required
                />

                <div className="grid grid-cols-3 gap-4">
                    <Input
                        label="Year"
                        id="year"
                        name="year"
                        type="number"
                        value={formData.year || ''}
                        onChange={handleChange}
                        required
                    />
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        >
                            {wineTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <Input
                        label="Rating (0-100)"
                        id="rating"
                        name="rating"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.rating || 0}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Country"
                        id="country"
                        name="country"
                        value={formData.country || ''}
                        onChange={handleChange}
                    />
                    <Input
                        label="Region"
                        id="region"
                        name="region"
                        value={formData.region || ''}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description || ''}
                        onChange={handleChange}
                        className="block w-full rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    />
                </div>

                {/* Initial Stock Section - Only for New Wines */}
                {!initialData && (
                    <div className="pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="addStock"
                                checked={addStock}
                                onChange={(e) => setAddStock(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                            />
                            <label htmlFor="addStock" className="text-sm font-medium text-slate-200 select-none cursor-pointer">
                                Add bottles to inventory now?
                            </label>
                        </div>

                        {addStock && (
                            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800 space-y-4">
                                <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                    <Plus size={16} className="text-indigo-400" /> Initial Inventory
                                </h4>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
                                    <select
                                        className="block w-full rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                                        value={selectedLocationId}
                                        onChange={(e) => { setSelectedLocationId(e.target.value); setSelectedUnitId(''); }}
                                    >
                                        {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Storage Unit</label>
                                    <select
                                        className="block w-full rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                                        value={selectedUnitId}
                                        onChange={(e) => setSelectedUnitId(e.target.value)}
                                        disabled={!selectedLocationId}
                                    >
                                        {availableUnits.length > 0 ? (
                                            availableUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)
                                        ) : <option value="">No units available</option>}
                                    </select>
                                </div>

                                <Input
                                    label="Quantity"
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                />

                                {stockError && (
                                    <p className="text-sm text-red-400">{stockError}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">{initialData ? 'Save Changes' : (addStock ? `Save & Add ${quantity} Bottle${quantity > 1 ? 's' : ''}` : 'Add Wine')}</Button>
                </div>
            </form>
            {initialData && <BottleList wineId={initialData.id} />}
        </div >
    );
};
