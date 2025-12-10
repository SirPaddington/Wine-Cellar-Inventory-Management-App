import React, { useState, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useCellarStore } from '../store/cellarStore';
import { RackVisualizer } from '../components/Cellar3D/RackVisualizer';
import { CrateVisualizer } from '../components/Cellar3D/CrateVisualizer';
import { Warehouse, Wine } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '../components/ui/Modal';
import { useInventoryStore } from '../store/inventoryStore';

import { BottleActionMenu } from '../components/Cellar3D/BottleActionMenu';
import { AddWineForm } from '../components/Inventory/AddWineForm';
import { EditBottleLocationModal } from '../components/Inventory/EditBottleLocationModal';
import { ConsumeBottleModal } from '../components/Inventory/ConsumeBottleModal';


const Cellar3D: React.FC = () => {
    const locations = useCellarStore((state) => state.locations);
    const units = useCellarStore((state) => state.units);
    const [selectedLocationId, setSelectedLocationId] = useState<string>(locations[0]?.id || '');

    // Interaction States
    const [selectedBottleId, setSelectedBottleId] = useState<string | null>(null);
    const [editingWineId, setEditingWineId] = useState<string | null>(null);
    const [movingBottleId, setMovingBottleId] = useState<string | null>(null);
    const [consumingBottleId, setConsumingBottleId] = useState<string | null>(null);

    const getWine = useInventoryStore(state => state.getWine);
    const bottles = useInventoryStore(state => state.bottles);

    const filteredUnits = units.filter(u => u.locationId === selectedLocationId);

    const locationStats = useMemo(() => {
        const storedBottles = bottles.filter(b => b.status === 'Stored');
        return locations.reduce((acc, loc) => {
            const locUnits = units.filter(u => u.locationId === loc.id);
            const capacity = locUnits.reduce((sum, u) => sum + (u.dimensions.width * u.dimensions.height * u.dimensions.depth), 0);
            const used = storedBottles.filter(b => b.locationId === loc.id).length;
            acc[loc.id] = { capacity, used, open: Math.max(0, capacity - used) };
            return acc;
        }, {} as Record<string, { capacity: number, used: number, open: number }>);
    }, [locations, units, bottles]);

    // Heuristic for layout:
    // If location name contains "Locker", stack vertically.
    // Otherwise, place horizontally.
    const isLocker = locations.find(l => l.id === selectedLocationId)?.name.toLowerCase().includes('locker');

    const handleEditWine = (wineId: string) => {
        setSelectedBottleId(null);
        setEditingWineId(wineId);
    };

    const handleMoveBottle = (bottleId: string) => {
        setSelectedBottleId(null);
        setMovingBottleId(bottleId);
    };

    const handleConsumeBottle = (bottleId: string) => {
        setSelectedBottleId(null);
        setConsumingBottleId(bottleId);
    };

    return (
        <div className="flex h-full bg-neutral-950 relative overflow-hidden">
            {/* Main 3D Canvas Area */}
            <div className="flex-1 relative h-full bg-neutral-950">
                {/* UI Overlay */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                    <div className="bg-slate-950/80 backdrop-blur p-4 rounded-xl border border-slate-800 shadow-xl pointer-events-auto">
                        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <Warehouse size={18} className="text-indigo-400" />
                            Location View
                        </h2>
                        <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
                            {locations.map(loc => {
                                const stats = locationStats[loc.id];
                                return (
                                    <button
                                        key={loc.id}
                                        onClick={() => setSelectedLocationId(loc.id)}
                                        className={clsx(
                                            "text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center group",
                                            selectedLocationId === loc.id
                                                ? "bg-indigo-600 text-white"
                                                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                        )}
                                    >
                                        <span className="font-medium truncate">{loc.name}</span>
                                        {stats && (
                                            <span className={clsx(
                                                "text-[10px] font-mono px-1.5 py-0.5 rounded ml-2",
                                                selectedLocationId === loc.id
                                                    ? "bg-indigo-500/50 text-indigo-100"
                                                    : "bg-neutral-900 text-neutral-500 group-hover:text-neutral-300"
                                            )}>
                                                {stats.open} left
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 3D Scene */}
                <Canvas shadows camera={{ position: [4, 4, 8], fov: 50 }} className="bg-slate-900">
                    <Suspense fallback={null}>
                        <Environment preset="city" />
                        <ambientLight intensity={0.5} />
                        <pointLight position={[10, 10, 10]} intensity={1} castShadow />

                        <group position={[0, -2, 0]}>
                            {filteredUnits.map((unit, index) => {
                                let pos: [number, number, number] = [index * 2.5, 0, 0];
                                if (isLocker) {
                                    pos = [0, index * 2.2, 0];
                                }

                                if (unit.type === 'crate') {
                                    return (
                                        <CrateVisualizer
                                            key={unit.id}
                                            unit={unit}
                                            position={pos}
                                            onBottleClick={setSelectedBottleId}
                                        />
                                    );
                                }

                                return (
                                    <RackVisualizer
                                        key={unit.id}
                                        unit={unit}
                                        position={pos}
                                        onBottleClick={setSelectedBottleId}
                                    />
                                );
                            })}
                        </group>

                        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Sidebar Panel (Permanent) */}
            <div className="h-full bg-slate-950 border-l border-slate-800 shadow-2xl relative z-20 w-[480px] flex-shrink-0">
                <div className="h-full p-6 overflow-y-auto">
                    {selectedBottleId ? (
                        <BottleActionMenu
                            bottleId={selectedBottleId}
                            onClose={() => setSelectedBottleId(null)}
                            onEditWine={handleEditWine}
                            onMoveBottle={handleMoveBottle}
                            onConsumeBottle={handleConsumeBottle}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-4">
                            <Wine size={48} className="opacity-20" />
                            <p>Select a bottle from the rack<br />to view details</p>
                            <p className="text-xs font-mono text-slate-700 mt-4">Debug ID: {selectedBottleId || 'None'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Interaction Modals (Portals) */}
            <Modal isOpen={!!editingWineId} onClose={() => setEditingWineId(null)} title="Edit Wine Details" size="lg">
                {editingWineId && (
                    <AddWineForm
                        initialData={getWine(editingWineId)}
                        onSuccess={() => setEditingWineId(null)}
                        onCancel={() => setEditingWineId(null)}
                    />
                )}
            </Modal>

            <Modal isOpen={!!movingBottleId} onClose={() => setMovingBottleId(null)} title="Move Bottle">
                {movingBottleId && bottles.find(b => b.id === movingBottleId) && (
                    <EditBottleLocationModal
                        bottle={bottles.find(b => b.id === movingBottleId)!}
                        onSuccess={() => setMovingBottleId(null)}
                        onCancel={() => setMovingBottleId(null)}
                    />
                )}
            </Modal>

            <Modal isOpen={!!consumingBottleId} onClose={() => setConsumingBottleId(null)} title="Drink Wine">
                {consumingBottleId && (
                    <ConsumeBottleModal
                        wineId={bottles.find(b => b.id === consumingBottleId)?.wineId || ''}
                        onSuccess={() => setConsumingBottleId(null)}
                        onCancel={() => setConsumingBottleId(null)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default Cellar3D;
