import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Location, StorageUnit } from '../types';

interface CellarState {
    locations: Location[];
    units: StorageUnit[];
    addLocation: (loc: Location) => void;
    updateLocation: (id: string, updates: Partial<Location>) => void;
    addUnit: (unit: StorageUnit) => void;
    updateUnit: (id: string, updates: Partial<StorageUnit>) => void;
    deleteLocation: (id: string) => void;
    deleteUnit: (id: string) => void;
    // Initialize default data if empty
    initializeDefaults: () => void;
}

const DEFAULT_LOCATIONS: Location[] = [
    { id: 'loc-locker', name: 'Private Locker', description: 'Climate controlled off-site locker' },
    { id: 'loc-home', name: 'Home', description: 'Home wine rack' },
    { id: 'loc-gift', name: 'Gift Cabinet', description: 'Vertical storage cabinet' },
];

// Locker Config: 4 boxes.
// Bottom box (Box 1): 8x8, depth 2 (front row blocked). 
// Typically we model "blocked" slots as maxDepth=0 or reduced depth.
// Plan says: "bottom of the 4 only has a depth of 2".
// We can set default dimensions 8x8x3 for all, but for Box 1 override depth to 2.
// Wait, the locker is 4 *separate* boxes stacked? Or one unit?
// "4 vertically stacked boxes that are an 8x8 grid of slots". 
// It's probably best to model them as 4 separate "Units" in the "Locker" Location for easier visualization, 
// OR 1 Unit with 32 rows? 
// 4 boxes implies distinct containers. Let's do 4 Units: "Locker Box 1 (Bottom)", "Locker Box 2", etc.
// Box 1: 8x8x2.
// Box 2-4: 8x8x3.

const DEFAULT_UNITS: StorageUnit[] = [
    // Locker
    {
        id: 'unit-locker-1', locationId: 'loc-locker', name: 'Box 1 (Bottom)', type: 'grid',
        dimensions: { width: 8, height: 8, depth: 2 }
    },
    {
        id: 'unit-locker-2', locationId: 'loc-locker', name: 'Box 2', type: 'grid',
        dimensions: { width: 8, height: 8, depth: 3 }
    },
    {
        id: 'unit-locker-3', locationId: 'loc-locker', name: 'Box 3', type: 'grid',
        dimensions: { width: 8, height: 8, depth: 3 }
    },
    {
        id: 'unit-locker-4', locationId: 'loc-locker', name: 'Box 4 (Top)', type: 'grid',
        dimensions: { width: 8, height: 8, depth: 3 }
    },
    // Home: 8 wide x 4 tall, depth 1
    {
        id: 'unit-home-rack', locationId: 'loc-home', name: 'Main Rack', type: 'grid',
        dimensions: { width: 8, height: 4, depth: 1 }
    },
    // Gift: Vertical, 6 wide x 3 deep? 
    // "stored vertically where it is 3 deep by about 6 wide".
    // Vertical usually implies bottles stand up. "3 deep" might mean rows? 
    // Let's assume a grid where "width" is 6, "depth" is 3, "height" is 1 (floor/shelf).
    {
        id: 'unit-gift-cabinet', locationId: 'loc-gift', name: 'Cabinet', type: 'vertical_drawer',
        dimensions: { width: 6, height: 1, depth: 3 }
    },
];

export const useCellarStore = create<CellarState>()(
    persist(
        (set, get) => ({
            locations: [],
            units: [],
            addLocation: (loc) => set((state) => ({ locations: [...state.locations, loc] })),
            updateLocation: (id, updates) => set((state) => ({ locations: state.locations.map(l => l.id === id ? { ...l, ...updates } : l) })),
            addUnit: (unit) => set((state) => ({ units: [...state.units, unit] })),
            updateUnit: (id, updates) => set((state) => ({ units: state.units.map(u => u.id === id ? { ...u, ...updates } : u) })),
            deleteLocation: (id) => set((state) => ({
                locations: state.locations.filter(l => l.id !== id),
                units: state.units.filter(u => u.locationId !== id) // Cascade delete units
            })),
            deleteUnit: (id) => set((state) => ({ units: state.units.filter(u => u.id !== id) })),
            initializeDefaults: () => {
                const state = get();
                if (state.locations.length === 0) {
                    set({ locations: DEFAULT_LOCATIONS, units: DEFAULT_UNITS });
                }
            }
        }),
        {
            name: 'wine-cellar-storage',
            onRehydrateStorage: () => (state) => {
                state?.initializeDefaults();
            }
        }
    )
);
