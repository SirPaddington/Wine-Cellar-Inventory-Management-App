import React from 'react';
import type { StorageUnit } from '../../types';
import { Text } from '@react-three/drei';
import { BottleVisualizer } from './BottleVisualizer';
import { useInventoryStore } from '../../store/inventoryStore';

interface RackVisualizerProps {
    unit: StorageUnit;
    position: [number, number, number];
    onBottleClick?: (bottleId: string) => void;
    onDragStateChange?: (dragging: boolean) => void;
}

export const RackVisualizer: React.FC<RackVisualizerProps> = ({ unit, position, onBottleClick, onDragStateChange }) => {
    const width = unit.dimensions?.width || 1;
    const height = unit.dimensions?.height || 1;
    const depth = unit.dimensions?.depth || 1;
    const bottles = useInventoryStore(state => state.bottles);
    const updateBottle = useInventoryStore(state => state.updateBottle);

    // Simple rack geometry generation
    // We visualize the "Structure" as a wireframe or thin boxes? 
    // Let's use simple boxes for shelves for now.

    // Calculate total size to center the pivot
    const cellWidth = 0.25; // 25cm approx per bottle slot width
    const cellHeight = 0.25;
    const cellDepth = 0.35; // 35cm depth

    // Determine actual rack size
    const rackW = width * cellWidth;
    const rackH = height * cellHeight;
    const rackD = depth * cellDepth;

    const handleBottleFinishDrag = (bottleId: string, newX: number, newY: number) => {
        // Validation:
        // 1. Within bounds
        if (newX < 0 || newX >= width || newY < 0 || newY >= height) {
            console.warn('Drag out of bounds', newX, newY);
            return;
        }

        // 2. Slot empty?
        const isOccupied = bottles.some(b =>
            b.locationId === unit.id &&
            b.id !== bottleId &&
            b.x === newX &&
            b.y === newY
        );

        if (isOccupied) {
            console.warn('Slot occupied', newX, newY);
            // Optional: Swap logic? For now, just reject.
            return;
        }

        // Update
        updateBottle(bottleId, { x: newX, y: newY });
    };

    return (
        <group position={position}>
            {/* Label */}
            {/* Label - Side floating (Vertical) */}
            <Text
                position={[-rackW / 2 - 0.2, rackH / 2, 0]}
                rotation={[0, 0, Math.PI / 2]}
                fontSize={0.2}
                color="#cbd5e1"
                anchorX="center"
                anchorY="bottom"
                fillOpacity={1}
                raycast={() => null}
            >
                {unit.name}
            </Text>

            {/* Frame/Structure */}
            <mesh position={[0, rackH / 2, 0]} raycast={() => null}>
                <boxGeometry args={[rackW, rackH, rackD]} />
                <meshStandardMaterial color="#334155" wireframe />
            </mesh>

            {/* Back Panel */}
            <mesh position={[0, rackH / 2, -rackD / 2]} raycast={() => null}>
                <boxGeometry args={[rackW, rackH, 0.02]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>

            {/* Shelves Visualization (Simplified) */}
            {Array.from({ length: height }).map((_, y) => (
                <mesh
                    key={`shelf-${y}`}
                    position={[0, (y * cellHeight) + 0.01, 0]}
                    raycast={() => null}
                >
                    <boxGeometry args={[rackW, 0.02, rackD]} />
                    <meshStandardMaterial color="#475569" />
                </mesh>
            ))}

            {/* Bottles */}
            {/* We'll iterate through slots to check for bottles or render placed bottles */}
            {/* For performance in large racks, we should just query bottles in this unit */}
            {bottles
                .filter(b => b.unitId === unit.id && b.status === 'Stored')
                .map(bottle => {
                    // Calculate position based on grid
                    // x, y are 0-indexed. x is column, y is row.
                    // Origin of rack is center bottom.
                    // X: -rackW/2 + (bottle.x * cw) + cw/2
                    const posX = -rackW / 2 + (bottle.x * cellWidth) + cellWidth / 2;
                    const posY = (bottle.y * cellHeight) + 0.02; // Sitting on shelf
                    // Depth: Front is +Z? Usually -Z is forward in WebGL? No, +Z is usually toward camera.
                    // Let's assume standard view: Camera at +Z Looking at origin.
                    // Rack front is +rackD/2?
                    // Let's define: Depth 0 is FRONT. Depth N is BACK.
                    // RackD spans from -rackD/2 (back) to +rackD/2 (front).
                    // Slot 0 (front): Z = +rackD/2 - cellDepth/2
                    const posZ = (rackD / 2) - (bottle.depth * cellDepth) - (cellDepth / 2);

                    return (
                        <BottleVisualizer
                            key={bottle.id}
                            bottle={bottle}
                            position={[posX, posY, posZ]}
                            onClick={() => onBottleClick?.(bottle.id)}

                            // Drag props
                            cellWidth={cellWidth}
                            cellHeight={cellHeight}
                            onDragStateChange={onDragStateChange}
                            onFinishDrag={(newX, newY) => handleBottleFinishDrag(bottle.id, newX, newY)}
                        />
                    );
                })
            }
        </group>
    );
};
