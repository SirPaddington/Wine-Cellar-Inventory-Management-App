import React, { useState } from 'react';
import type { Bottle } from '../../types';
import { useInventoryStore } from '../../store/inventoryStore';
import { Html } from '@react-three/drei';

interface BottleVisualizerProps {
    bottle: Bottle;
    position: [number, number, number];
    onClick?: () => void;
}

export const BottleVisualizer: React.FC<BottleVisualizerProps> = ({ bottle, position, onClick }) => {
    const wine = useInventoryStore(state => state.getWine(bottle.wineId));
    const [hovered, setHovered] = useState(false);
    const [clicked, setClicked] = useState(false);

    const wineType = wine?.type || 'Red';

    // Determine color based on wine type
    // Updated colors for better realism and "fun" sparkling look
    const colorMap: Record<string, string> = {
        'Red': '#722F37', // Merlot
        'White': '#F9E8C0', // Chardonnay/Light Yellow
        'Rosé': '#fd928fff', // Provence Rosé
        'Sparkling': '#F7E7CE', // Champagne body
        'Dessert': '#DAA520', // Golden
        'Fortified': '#521820', // Port
    };

    const isSparkling = wineType === 'Sparkling';

    // Sparkling wines get a Gold foil neck (#FFD700)
    // Others get standard dark glass neck (#1f2937)
    const glassColor = clicked ? '#00ff00' : (isSparkling ? '#FFD700' : '#1f2937');

    const liquidColor = clicked ? '#00ff00' : (colorMap[wineType] || '#722F37');

    const handleClick = (e: any) => {
        e.stopPropagation();
        setClicked(true);
        console.log("Bottle clicked:", bottle.id);
        onClick?.();
        setTimeout(() => setClicked(false), 300);
    };

    // Simple bottle shape: Body + Neck
    return (
        <group position={position}>
            {/* Tooltip on Hover */}
            {hovered && (
                <Html position={[0, 0.4, 0]} center style={{ pointerEvents: 'none' }}>
                    <div className="bg-slate-900/90 text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-50">
                        <div className="font-bold">{wine?.producer}</div>
                        <div>{wine?.name} ({wine?.year})</div>
                        <div className="text-[10px] text-slate-400 mt-1">Click to view</div>
                    </div>
                </Html>
            )}

            <group rotation={[Math.PI / 2, 0, 0]}>
                {/* HitBox: Invisible Cylinder covering the entire bottle */}
                {/* Ensuring HitBox is clickable */}
                <mesh
                    position={[0, 0.08, 0]}
                    onClick={handleClick}
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                    onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
                >
                    <cylinderGeometry args={[0.045, 0.045, 0.35, 8]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>

                {/* Visuals - Enabled Raycast + Events (Redundancy) */}
                {/* Body */}
                <mesh
                    position={[0, 0, 0]}
                    onClick={handleClick}
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                    onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
                >
                    <cylinderGeometry args={[0.038, 0.038, 0.22, 16]} />
                    <meshStandardMaterial
                        color={liquidColor}
                        roughness={isSparkling ? 0.1 : 0.2}
                        metalness={isSparkling ? 0.4 : 0.2}
                    />
                </mesh>

                {/* Neck */}
                <mesh
                    position={[0, 0.15, 0]}
                    onClick={handleClick}
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                    onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
                >
                    <cylinderGeometry args={[0.012, 0.035, 0.08, 16]} />
                    <meshStandardMaterial
                        color={glassColor}
                        roughness={0.2}
                        metalness={isSparkling ? 0.9 : 0.8}
                    />
                </mesh>

                {/* Cork/Cap */}
                <mesh
                    position={[0, 0.19, 0]}
                    onClick={handleClick}
                    onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
                    onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
                >
                    <cylinderGeometry args={[0.013, 0.013, 0.02, 16]} />
                    <meshStandardMaterial color={isSparkling ? "#DAA520" : "#8a1c1c"} />
                </mesh>
            </group>
        </group>
    );
};
