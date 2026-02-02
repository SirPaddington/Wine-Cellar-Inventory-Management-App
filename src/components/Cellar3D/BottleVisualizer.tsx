import React, { useState, useRef, useEffect } from 'react';
import type { Bottle } from '../../types';
import { useInventoryStore } from '../../store/inventoryStore';
import { Html } from '@react-three/drei';
import { useDrag } from '@use-gesture/react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface BottleVisualizerProps {
    bottle: Bottle;
    position: [number, number, number];
    onClick?: () => void;
    cellWidth?: number;
    cellHeight?: number;
    onDragStateChange?: (dragging: boolean) => void;
    onFinishDrag?: (newX: number, newY: number) => void;
}

export const BottleVisualizer: React.FC<BottleVisualizerProps> = ({
    bottle,
    position: initialPosition,
    onClick,
    cellWidth = 0.25,
    cellHeight = 0.25,
    onDragStateChange,
    onFinishDrag
}) => {
    const wine = useInventoryStore(state => state.getWine(bottle.wineId));
    const [hovered, setHovered] = useState(false);
    const [clicked, setClicked] = useState(false);

    // Drag state
    const [dragging, setDragging] = useState(false);
    const groupRef = useRef<THREE.Group>(null);
    const [visualPos, setVisualPos] = useState(initialPosition);

    useEffect(() => {
        if (!dragging) setVisualPos(initialPosition);
    }, [initialPosition, dragging]);

    const { raycaster } = useThree();

    const bind = useDrag(({ active }) => {
        if (active) {
            if (!dragging) {
                setDragging(true);
                onDragStateChange?.(true);
                document.body.style.cursor = 'grabbing';
            }

            // Raycasting logic
            const parent = groupRef.current?.parent;
            if (!parent) return;

            const planeNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(parent.getWorldQuaternion(new THREE.Quaternion()));
            const planePoint = new THREE.Vector3(0, 0, initialPosition[2]).applyMatrix4(parent.matrixWorld);
            const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);
            const target = new THREE.Vector3();

            raycaster.ray.intersectPlane(plane, target);

            if (target) {
                parent.worldToLocal(target);
                setVisualPos([target.x, target.y, initialPosition[2]]);
            }
        } else {
            setDragging(false);
            onDragStateChange?.(false);
            document.body.style.cursor = 'auto';

            const deltaX = visualPos[0] - initialPosition[0];
            const deltaY = visualPos[1] - initialPosition[1];
            const colChange = Math.round(deltaX / cellWidth);
            const rowChange = Math.round(deltaY / cellHeight);

            const newX = bottle.x + colChange;
            const newY = bottle.y + rowChange;

            if (colChange !== 0 || rowChange !== 0) {
                onFinishDrag?.(newX, newY);
            } else {
                setVisualPos(initialPosition);
            }
        }
    }, { pointerEvents: true, filterTaps: true });

    const wineType = wine?.type || 'Red';
    const colorMap: Record<string, string> = {
        'Red': '#722F37', // Merlot
        'White': '#F9E8C0', // Chardonnay/Light Yellow
        'Rosé': '#fd928fff', // Provence Rosé
        'Sparkling': '#F7E7CE', // Champagne body
        'Dessert': '#DAA520', // Golden
        'Fortified': '#521820', // Port
    };

    const isSparkling = wineType === 'Sparkling';
    const glassColor = clicked ? '#00ff00' : (isSparkling ? '#FFD700' : '#1f2937');
    const liquidColor = clicked ? '#00ff00' : (colorMap[wineType] || '#722F37');

    const handleClick = (e: any) => {
        if (dragging) return;
        e.stopPropagation();
        setClicked(true);
        console.log("Bottle clicked:", bottle.id);
        onClick?.();
        setTimeout(() => setClicked(false), 300);
    };

    return (
        <group ref={groupRef} position={visualPos} {...bind()}>
            {/* Tooltip */}
            {hovered && !dragging && (
                <Html position={[0, 0.4, 0]} center style={{ pointerEvents: 'none' }}>
                    <div className="bg-slate-900/90 text-white text-xs px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-50">
                        <div className="font-bold">{wine?.producer}</div>
                        <div>{wine?.name} ({wine?.year})</div>
                        <div className="text-[10px] text-slate-400 mt-1">
                            {dragging ? 'Moving...' : 'Click to view'}
                        </div>
                    </div>
                </Html>
            )}

            <group rotation={[Math.PI / 2, 0, 0]}>
                {/* HitBox */}
                <mesh
                    position={[0, 0.08, 0]}
                    onClick={handleClick}
                    onPointerOver={(e) => {
                        if (dragging) return;
                        e.stopPropagation();
                        setHovered(true);
                        document.body.style.cursor = 'grab';
                    }}
                    onPointerOut={(e) => {
                        if (dragging) return;
                        e.stopPropagation();
                        setHovered(false);
                        document.body.style.cursor = 'auto';
                    }}
                >
                    <cylinderGeometry args={[0.045, 0.045, 0.35, 8]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>

                {/* Body */}
                <mesh position={[0, 0, 0]}>
                    <cylinderGeometry args={[0.038, 0.038, 0.22, 16]} />
                    <meshStandardMaterial
                        color={liquidColor}
                        roughness={isSparkling ? 0.1 : 0.2}
                        metalness={isSparkling ? 0.4 : 0.2}
                    />
                </mesh>

                {/* Neck */}
                <mesh position={[0, 0.15, 0]}>
                    <cylinderGeometry args={[0.012, 0.035, 0.08, 16]} />
                    <meshStandardMaterial
                        color={glassColor}
                        roughness={0.2}
                        metalness={isSparkling ? 0.9 : 0.8}
                    />
                </mesh>

                {/* Cork/Cap */}
                <mesh position={[0, 0.19, 0]}>
                    <cylinderGeometry args={[0.013, 0.013, 0.02, 16]} />
                    <meshStandardMaterial color={isSparkling ? "#DAA520" : "#8a1c1c"} />
                </mesh>
            </group>
        </group>
    );
};
