
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// MOCK STORE COPY for isolation
interface Location { id: string; name: string; description?: string; }
interface StorageUnit { id: string; locationId: string; name: string; type: any; dimensions: any; }

interface CellarState {
    locations: Location[];
    units: StorageUnit[];
    initializeDefaults: () => void;
    updateUnit: (id: string, updates: Partial<StorageUnit>) => void;
}

const DEFAULT_LOCATIONS = [{ id: 'loc-1', name: 'Locker' }];
const DEFAULT_UNITS = [
    { id: 'u-1', locationId: 'loc-1', name: 'Box 1', type: 'grid', dimensions: { w: 8, h: 8, d: 2 } },
    { id: 'u-2', locationId: 'loc-1', name: 'Box 2', type: 'grid', dimensions: { w: 8, h: 8, d: 3 } },
    { id: 'u-3', locationId: 'loc-1', name: 'Box 3', type: 'grid', dimensions: { w: 8, h: 8, d: 3 } },
    { id: 'u-4', locationId: 'loc-1', name: 'Box 4', type: 'grid', dimensions: { w: 8, h: 8, d: 3 } },
];

const useCellarStore = create<CellarState>()(
    // omitting persist for simple logic test, assuming logic inside is what matters
    (set, get) => ({
        locations: DEFAULT_LOCATIONS,
        units: DEFAULT_UNITS, // Start populated
        initializeDefaults: () => { },
        updateUnit: (id, updates) => set((state) => {
            const newUnits = state.units.map(u => u.id === id ? { ...u, ...updates } : u);
            console.log("Updating unit", id, "Count before:", state.units.length, "Count after:", newUnits.length);
            return { units: newUnits };
        }),
    })
);

// TEST
const store = useCellarStore.getState();
console.log("Initial Units:", store.units.length);

// Simulate Update
console.log("Updating Box 1...");
store.updateUnit('u-1', { dimensions: { w: 8, h: 8, d: 1 } });

const updatedStore = useCellarStore.getState();
console.log("Final Units:", updatedStore.units.length);
updatedStore.units.forEach(u => console.log(u.id, u.name, u.dimensions));

if (updatedStore.units.length !== 4) {
    console.error("FAIL: Units disappeared!");
    process.exit(1);
} else {
    console.log("SUCCESS: All units present.");
}
