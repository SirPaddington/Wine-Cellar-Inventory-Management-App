export type WineType = 'Red' | 'White' | 'Rosé' | 'Sparkling' | 'Dessert' | 'Fortified';

export interface Wine {
    id: string;
    name: string;
    producer: string;
    vineyard?: string;
    year: number;
    type: WineType;
    varietal: string[]; // e.g., ["Cabernet Sauvignon", "Merlot"]
    country: string;
    region: string;
    description?: string;
    rating?: number; // 0-100 or 0-5
    pairings?: string[];
    image?: string;
}

export type BottleStatus = 'Stored' | 'Consumed' | 'Gifted';

export interface Bottle {
    id: string;
    wineId: string;
    locationId: string;
    unitId: string;
    // Position in the unit
    x: number; // Column (0-indexed)
    y: number; // Row (0-indexed)
    depth: number; // Depth position (0-indexed, 0 is front)
    status: BottleStatus;
    dateAdded: string; // ISO Date
    dateConsumed?: string; // ISO Date
    consumptionRating?: number; // 0-5 or 0-100
    consumptionNotes?: string;
}

export interface Location {
    id: string;
    name: string;
    description?: string;
}

export type StorageUnitType = 'grid' | 'list' | 'vertical_drawer' | 'crate';

export interface StorageUnitConfig {
    // Custom depth map for complex units like the Locker
    // Key: "y-x" (row-col), Value: maxDepth for that slot
    customDepthMap?: Record<string, number>;
}

export interface StorageUnit {
    id: string;
    locationId: string;
    name: string;
    type: StorageUnitType;
    dimensions: {
        width: number; // Columns
        height: number; // Rows
        depth: number; // Standard depth
    };
    config?: StorageUnitConfig;
}

// Stats for dashboard
export interface CellarStats {
    totalBottles: number;
    totalValue: number; // If we track price
    byType: Record<WineType, number>;
}
