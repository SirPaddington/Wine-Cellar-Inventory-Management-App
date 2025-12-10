import React, { useMemo } from 'react';
import { Box } from '@react-three/drei';
import * as THREE from 'three';
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

    const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#8B4513',
        roughness: 1,
        map: null
    }), []);

    const bottles = useInventoryStore(state => state.bottles.filter(b => b.unitId === unit.id && b.status === 'Stored'));

    // Crate Dimensions Helper
    // A standard bottle is ~8cm diam. 
    // Spacing ~10cm.
    const spacing = 0.12;

    // Calculate dimensions
    const crateWidth = unit.dimensions.width * spacing + 0.05;
    const crateDepth = unit.dimensions.height * spacing + 0.05;
    const crateHeight = 0.35;

    return (
        <group position={position}>
            {/* Crate Box */}
            <group position={[crateWidth / 2 - spacing / 2, crateHeight / 2, crateDepth / 2 - spacing / 2]}>
                {/* Bottom */}
                <Box args={[crateWidth, 0.02, crateDepth]} position={[0, -crateHeight / 2 + 0.01, 0]} material={woodMaterial} />
                {/* Sides */}
                <Box args={[0.02, crateHeight, crateDepth]} position={[-crateWidth / 2 + 0.01, 0, 0]} material={woodMaterial} />
                <Box args={[0.02, crateHeight, crateDepth]} position={[crateWidth / 2 - 0.01, 0, 0]} material={woodMaterial} />
                <Box args={[crateWidth, crateHeight, 0.02]} position={[0, 0, -crateDepth / 2 + 0.01]} material={woodMaterial} />
                <Box args={[crateWidth, crateHeight, 0.02]} position={[0, 0, crateDepth / 2 - 0.01]} material={woodMaterial} />
            </group>

            {/* Bottles */}
            {bottles.map(bottle => {
                // In a crate, x is width, y is depth
                const bx = bottle.x * spacing;
                const bz = bottle.y * spacing;

                return (
                    <BottleVisualizer
                        key={bottle.id}
                        bottle={bottle}
                        position={[bx, 0.02, bz]}
                        onClick={() => onBottleClick(bottle.id)}
                    />
                );
            })}
        </group>
    );
};
