import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Wine, Bottle } from '../types';

interface InventoryState {
    wines: Wine[];
    bottles: Bottle[];
    addWine: (wine: Wine) => void;
    updateWine: (id: string, updates: Partial<Wine>) => void;
    deleteWine: (id: string) => void;
    addBottle: (bottle: Bottle) => void;
    addBottles: (bottles: Bottle[]) => void;
    updateBottle: (id: string, updates: Partial<Bottle>) => void; // e.g. move bottle, consume
    deleteBottle: (id: string) => void;
    getBottlesByWine: (wineId: string) => Bottle[];
    getWine: (id: string) => Wine | undefined;
}

export const useInventoryStore = create<InventoryState>()(
    persist(
        (set, get) => ({
            wines: [],
            bottles: [],
            addWine: (wine) => set((state) => ({ wines: [...state.wines, wine] })),
            updateWine: (id, updates) =>
                set((state) => ({
                    wines: state.wines.map((w) => (w.id === id ? { ...w, ...updates } : w)),
                })),
            deleteWine: (id) =>
                set((state) => ({
                    wines: state.wines.filter((w) => w.id !== id),
                    bottles: state.bottles.filter((b) => b.wineId !== id), // Cascade delete?
                })),
            addBottle: (bottle) => set((state) => ({ bottles: [...state.bottles, bottle] })),
            addBottles: (newBottles) => set((state) => ({ bottles: [...state.bottles, ...newBottles] })),
            updateBottle: (id, updates) =>
                set((state) => ({
                    bottles: state.bottles.map((b) => (b.id === id ? { ...b, ...updates } : b)),
                })),
            deleteBottle: (id) =>
                set((state) => ({
                    bottles: state.bottles.filter((b) => b.id !== id),
                })),
            getBottlesByWine: (wineId) => get().bottles.filter((b) => b.wineId === wineId),
            getWine: (id) => get().wines.find((w) => w.id === id),
        }),
        {
            name: 'wine-inventory-storage',
        }
    )
);
