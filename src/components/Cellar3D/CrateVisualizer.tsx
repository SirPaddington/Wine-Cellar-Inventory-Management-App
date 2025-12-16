import React from 'react';
import type { StorageUnit, Bottle } from '../../types';
import { BottleVisualizer } from './BottleVisualizer';
import { useInventoryStore } from '../../store/inventoryStore';

interface CrateVisualizerProps {
    unit: StorageUnit;
    position: [number, number, number];
    bottles?: Bottle[];
    onBottleClick: (id: string | null) => void;
}

export const CrateVisualizer: React.FC<CrateVisualizerProps> = ({ unit, position, onBottleClick }) => {
    // Crates are usually on the floor or stacked.
    // Dimensions: width x height (cols x rows)
    // Full Case: 3x4 (12 bottles) or 4x3.
    // Half Case: 2x3 (6 bottles).

    const bottles = useInventoryStore(state => state.bottles);
    const unitBottles = bottles.filter(b => b.unitId === unit.id && b.status === 'Stored');

    // Crate Dimensions Helper
    // A standard bottle is ~8cm diam. 
    // Spacing ~10cm.
    const spacing = 0.12;

    // Calculate dimensions with safeguards
    const width = unit.dimensions?.width || 1;   // Columns (Left/Right)
    const height = unit.dimensions?.height || 1; // Rows (Vertical Up/Down)
    const depth = unit.dimensions?.depth || 1;   // Depth (Front/Back)

    // Crate Size Calculation
    const crateWidth = width * spacing + 0.05;

    // Vertical Height based on Rows
    const crateHeight = height * spacing + 0.05;

    // Depth usually 1 for standard crates (single layer deep), but supports deeper
    const cellDepth = 0.35; // Standard bottle length approx
    const crateDepth = (depth * cellDepth) + 0.05;

    if (isNaN(crateWidth) || isNaN(crateHeight)) {
        console.error('[CrateVisualizer] NaN dimensions detected!', { width, height, spacing });
        return null;
    }

    // Simplified Rendering for Debugging
    const finalCrateWidth = crateWidth;
    const finalCrateHeight = crateHeight;
    const finalCrateDepth = crateDepth;

    return (
        <group position={position}>
            {/* Crate Box - Semi-transparent */}
            {/* Position Y = crateHeight/2 to sit on floor */}
            <mesh position={[0, finalCrateHeight / 2, 0]}>
                <boxGeometry args={[finalCrateWidth, finalCrateHeight, finalCrateDepth]} />
                <meshStandardMaterial color="#8B4513" transparent opacity={0.3} side={2} />
            </mesh>

            {/* Grid Visualization (Empty Slot Markers) - Vertical Grid */}
            {Array.from({ length: Math.ceil(width) }).map((_, bx) => (
                Array.from({ length: Math.ceil(height) }).map((_, by) => {
                    const posX = -finalCrateWidth / 2 + (bx * spacing) + 0.06;
                    const posY = (by * spacing) + 0.06;
                    const posZ = 0; // Front face usually

                    return (
                        <group key={`grid-${bx}-${by}`} position={[posX, posY, posZ]}>
                            {/* Slot Marker (Circle facing camera/front) */}
                            <mesh rotation={[0, 0, 0]}>
                                <ringGeometry args={[0.03, 0.035, 16]} />
                                <meshBasicMaterial color="#ffffff" opacity={0.2} transparent />
                            </mesh>
                        </group>
                    );
                })
            ))}

            {/* Bottles */}
            {unitBottles.map(bottle => {
                // X = Column
                const posX = -finalCrateWidth / 2 + (bottle.x * spacing) + 0.06;
                // Y = Row (Vertical)
                const posY = (bottle.y * spacing) + 0.02;

                // Z = Depth
                // Center Z is 0. 
                // Depth 0 (Front) -> +Z ? Or standard view is -Z?
                // RackVisualizer: const posZ = (rackD / 2) - (bottle.depth * cellDepth) - (cellDepth / 2);
                // Let's match RackVisualizer logic roughly.
                // If depth=1, bottle.depth=0. posZ = (crateDepth/2) - 0 - (0.35/2) = roughly 0.
                const posZ = (finalCrateDepth / 2) - (bottle.depth * cellDepth) - (cellDepth / 2);

                return (
                    <BottleVisualizer
                        key={bottle.id}
                        bottle={bottle}
                        position={[posX, posY, posZ]}
                        onClick={() => onBottleClick(bottle.id)}
                    />
                );
            })}
        </group>
    );
};
