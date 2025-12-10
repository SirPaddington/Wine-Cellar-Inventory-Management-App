import React, { useState } from 'react';
import { useCellarStore } from '../store/cellarStore';
import { Plus, Edit2, Box, Warehouse, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { AddLocationForm } from '../components/Configuration/AddLocationForm';
import { AddUnitForm } from '../components/Configuration/AddUnitForm';
import { DataManager } from '../components/Configuration/DataManager';
import type { Location, StorageUnit } from '../types';
import clsx from 'clsx';


export const ConfigurationPage: React.FC = () => {
    const locations = useCellarStore(state => state.locations);
    const units = useCellarStore(state => state.units);
    const deleteLocation = useCellarStore(state => state.deleteLocation);
    const addUnit = useCellarStore(state => state.addUnit);
    const deleteUnit = useCellarStore(state => state.deleteUnit); // Need delete unit too

    // UI State
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(locations[0]?.id || null);

    // Modal States
    const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);

    const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<StorageUnit | null>(null);

    const handleDeleteLocation = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Are you sure? This will delete the location and all its units and bottles.")) {
            deleteLocation(id);
            if (selectedLocationId === id) setSelectedLocationId(null);
        }
    };

    const handleDeleteUnit = (id: string) => {
        if (confirm("Delete this unit? All bottles in it will be removed.")) {
            deleteUnit(id);
        }
    };

    const handleAddCrate = (size: 12 | 6) => {
        const timestamp = Date.now();
        const shortId = Math.random().toString(36).substr(2, 5);
        // Dimensions: Width (Cols), Height (Rows)
        const dimensions = size === 12
            ? { width: 4, height: 3, depth: 1 }
            : { width: 3, height: 2, depth: 1 };

        const unit: StorageUnit = {
            id: `unit-crate-${timestamp}-${shortId}`,
            locationId: selectedLocationId!,
            name: `${size === 12 ? 'Full' : 'Half'} Case ${shortId}`,
            type: 'crate',
            dimensions
        };
        addUnit(unit);
    };

    const closeLocationModal = () => {
        setIsAddLocationOpen(false);
        setEditingLocation(null);
    };

    const closeUnitModal = () => {
        setIsAddUnitOpen(false);
        setEditingUnit(null);
    };

    const filteredUnits = selectedLocationId ? units.filter(u => u.locationId === selectedLocationId) : [];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 pt-20 lg:pt-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Cellar Configuration</h1>
                <p className="text-neutral-400">Manage your locations and storage units.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Locations Sidebar */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-200">Locations</h2>
                        <Button size="sm" variant="secondary" onClick={() => setIsAddLocationOpen(true)}><Plus size={16} /></Button>
                    </div>

                    <div className="space-y-2">
                        {locations.map(location => (
                            <div
                                key={location.id}
                                onClick={() => setSelectedLocationId(location.id)}
                                className={clsx(
                                    "p-4 rounded-xl border cursor-pointer transition-all group relative",
                                    selectedLocationId === location.id
                                        ? "bg-indigo-900/20 border-indigo-500 shadow-sm"
                                        : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                                )
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "p-2 rounded-lg",
                                        selectedLocationId === location.id ? "bg-indigo-900/50 text-indigo-300" : "bg-neutral-800 text-neutral-400"
                                    )}>
                                        <Warehouse size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-slate-200">{location.name}</h3>
                                        {location.description && <p className="text-xs text-slate-500">{location.description}</p>}
                                    </div>

                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            className="p-1.5 text-slate-500 hover:text-white transition-colors"
                                            onClick={(e) => { e.stopPropagation(); setEditingLocation(location); }}
                                            title="Edit Location"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                                            onClick={(e) => handleDeleteLocation(e, location.id)}
                                            title="Delete Location"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6">
                        <DataManager />
                    </div>
                </div>

                {/* Storage Units Main View */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-200">Storage Units</h2>
                        {selectedLocationId && (
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" className="text-xs" onClick={() => handleAddCrate(12)}>+ Full Case</Button>
                                <Button size="sm" variant="secondary" className="text-xs" onClick={() => handleAddCrate(6)}>+ Half Case</Button>
                                <Button size="sm" onClick={() => setIsAddUnitOpen(true)}><Plus size={16} className="mr-2" /> Add Unit</Button>
                            </div>
                        )}
                    </div>

                    {!selectedLocationId ? (
                        <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500">
                            <p>Select a location to manage units.</p>
                        </div>
                    ) : filteredUnits.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500">
                            <Box size={48} className="mb-4 opacity-20" />
                            <p>No storage units in this location.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredUnits.map(unit => (
                                <Card key={unit.id} className="p-4 bg-neutral-900/50">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-neutral-800 rounded-lg text-indigo-400">
                                                <Box size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-neutral-200">{unit.name}</h3>
                                                <p className="text-xs text-neutral-500 capitalize">{unit.type.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                className="p-1 text-slate-500 hover:text-white transition-colors"
                                                onClick={() => setEditingUnit(unit)}
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                                onClick={() => handleDeleteUnit(unit.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-6 text-sm text-slate-400 bg-slate-950/50 p-4 rounded-lg">
                                        <div>
                                            <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Width</span>
                                            <span className="font-mono text-lg text-slate-200">{unit.dimensions.width}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Height</span>
                                            <span className="font-mono text-lg text-slate-200">{unit.dimensions.height}</span>
                                        </div>
                                        <div>
                                            <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Depth</span>
                                            <span className="font-mono text-lg text-slate-200">{unit.dimensions.depth}</span>
                                        </div>
                                        <div className="text-right">
                                            {unit.dimensions.width * unit.dimensions.height * unit.dimensions.depth > 0 && (
                                                <>
                                                    <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Capacity</span>
                                                    <span className="font-mono text-lg text-indigo-400">{unit.dimensions.width * unit.dimensions.height * unit.dimensions.depth}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Location Modal */}
            <Modal
                isOpen={isAddLocationOpen || !!editingLocation}
                onClose={closeLocationModal}
                title={editingLocation ? "Edit Location" : "Add Location"}
            >
                <AddLocationForm
                    initialData={editingLocation || undefined}
                    onSuccess={closeLocationModal}
                    onCancel={closeLocationModal}
                />
            </Modal>

            {/* Unit Modal */}
            <Modal
                isOpen={isAddUnitOpen || !!editingUnit}
                onClose={closeUnitModal}
                title={editingUnit ? "Edit Storage Unit" : "Add Storage Unit"}
                size="lg" // Larger modal for unit form
            >
                {selectedLocationId && (
                    <AddUnitForm
                        locationId={selectedLocationId}
                        initialData={editingUnit || undefined}
                        onSuccess={closeUnitModal}
                        onCancel={closeUnitModal}
                    />
                )}
            </Modal>
        </div>
    );
};

export default ConfigurationPage;
