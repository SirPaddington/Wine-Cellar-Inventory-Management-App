import React, { useMemo } from 'react';
import { useInventoryStore } from '../store/inventoryStore';
import { useCellarStore } from '../store/cellarStore';
import { Card } from '../components/ui/Card';
import { Award, Wine as WineIcon, Activity, LayoutGrid } from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
    const wines = useInventoryStore(state => state.wines);
    const bottles = useInventoryStore(state => state.bottles);
    const locations = useCellarStore(state => state.locations);
    const units = useCellarStore(state => state.units);

    // Compute stats
    const stats = useMemo(() => {
        const storedBottles = bottles.filter(b => b.status === 'Stored');
        const consumedBottles = bottles.filter(b => b.status === 'Consumed');
        const totalBottles = storedBottles.length;

        // --- Capacity Logic ---
        const locationStats = locations.map(loc => {
            const locUnits = units.filter(u => u.locationId === loc.id);
            // Calculate raw capacity (slots)
            const capacity = locUnits.reduce((sum, u) => {
                // If custom depth logic existed, we'd handle it here. 
                // For now assuming uniform depth or standard rect.
                // Note: Locker Box 1 had depth 2 vs 3. dimensions.depth handles this per unit.
                return sum + (u.dimensions.width * u.dimensions.height * u.dimensions.depth);
            }, 0);

            const used = storedBottles.filter(b => b.locationId === loc.id).length;
            const open = Math.max(0, capacity - used);
            const percentFull = capacity > 0 ? (used / capacity) * 100 : 0;

            return {
                ...loc,
                capacity,
                used,
                open,
                percentFull
            };
        });

        const totalCapacity = locationStats.reduce((sum, loc) => sum + loc.capacity, 0);
        const totalOpen = Math.max(0, totalCapacity - totalBottles);


        // --- Top Wineries Logic ---
        const producerCounts: Record<string, number> = {};

        storedBottles.forEach(b => {
            const wine = wines.find(w => w.id === b.wineId);
            if (wine) {
                const producer = wine.producer;
                producerCounts[producer] = (producerCounts[producer] || 0) + 1;
            }
        });

        const topWineries = Object.entries(producerCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 3)
            .map(([name, count]) => ({ name, count }));

        // --- Top Varietal Logic ---
        const varietalCounts: Record<string, number> = {};
        storedBottles.forEach(b => {
            const wine = wines.find(w => w.id === b.wineId);
            if (wine) {
                // Use explicit varietal list if available, otherwise fallback to name (legacy/simple mode)
                const sources = (wine.varietal && wine.varietal.length > 0)
                    ? wine.varietal
                    : [wine.name];

                sources.forEach(v => {
                    // Clean up string just in case
                    const cleanV = v.trim();
                    if (cleanV) {
                        varietalCounts[cleanV] = (varietalCounts[cleanV] || 0) + 1;
                    }
                });
            }
        });
        const topVarietalEntry = Object.entries(varietalCounts).sort((a, b) => b[1] - a[1])[0];
        const topVarietal = topVarietalEntry ? topVarietalEntry[0] : 'None';

        // --- Best Tasting Logic ---
        const bestTasting = consumedBottles
            .filter(b => b.consumptionRating !== undefined && b.consumptionRating > 0)
            .sort((a, b) => (b.consumptionRating || 0) - (a.consumptionRating || 0))
            .map(b => {
                const wine = wines.find(w => w.id === b.wineId);
                const inStock = bottles.filter(sb => sb.wineId === b.wineId && sb.status === 'Stored').length;
                return {
                    ...b,
                    wineName: wine?.name,
                    producer: wine?.producer,
                    vineyard: wine?.vineyard,
                    year: wine?.year,
                    type: wine?.type,
                    inStock
                };
            })[0];

        return {
            totalBottles,
            consumedCount: consumedBottles.length,
            topWineries,
            bestTasting,
            locationStats,
            totalCapacity,
            totalOpen,
            topVarietal
        };
    }, [wines, bottles, locations, units]);

    return (
        <div className="p-8 pt-20 lg:pt-8 space-y-8">
            <div className="text-center mb-0">
                <h1 className="text-3xl font-bold text-white mb-2">Cellar Dashboard</h1>
                <p className="text-neutral-400">Overview of your wine collection.</p>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-neutral-900/50 flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                        <WineIcon size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400 font-medium">Total Bottles</p>
                        <p className="text-3xl font-bold text-white">{stats.totalBottles}</p>
                    </div>
                </Card>

                <Card className="p-6 bg-neutral-900/50 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400 font-medium">Top Varietal</p>
                        <p className="text-3xl font-bold text-white truncate max-w-[150px]" title={stats.topVarietal}>
                            {stats.topVarietal}
                        </p>
                    </div>
                </Card>

                <Card className="p-6 bg-neutral-900/50 flex items-center gap-4">
                    <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400 font-medium">Recent Activity</p>
                        <p className="text-3xl font-bold text-white">{stats.consumedCount} <span className="text-xs text-neutral-500 font-normal">consumed</span></p>
                    </div>
                </Card>

                <Card className="p-6 bg-neutral-900/50 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                        <LayoutGrid size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400 font-medium">Open Spaces</p>
                        <p className="text-3xl font-bold text-white">{stats.totalOpen}</p>
                    </div>
                </Card>
            </div>

            {/* Storage Breakdown Widget */}
            <Card className="p-6 bg-neutral-900/50">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Storage Capacity</h2>
                    <Link to="/cellar" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View 3D Cellar &rarr;</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.locationStats.map(loc => (
                        <div key={loc.id} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-200">{loc.name}</h4>
                                <span className={clsx(
                                    "text-xs font-bold px-2 py-1 rounded",
                                    loc.open === 0 ? "bg-red-900/30 text-red-400" : "bg-emerald-900/30 text-emerald-400"
                                )}>
                                    {loc.open} Open
                                </span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${loc.percentFull}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 text-right">
                                {loc.used} / {loc.capacity} slots filled
                            </p>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Wineries Widget */}
                <Card className="p-6 bg-slate-900/50">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <WineIcon className="text-indigo-400" />
                        Most Popular Wineries
                    </h3>

                    {stats.topWineries.length > 0 ? (
                        <div className="space-y-4">
                            {stats.topWineries.map((winery, index) => (
                                <div key={winery.name} className="flex items-center gap-4 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-400 font-bold text-sm">
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-slate-200">{winery.name}</h4>
                                    </div>
                                    <div className="text-indigo-400 font-mono font-bold">
                                        {winery.count} <span className="text-xs font-normal text-slate-500 ml-1">bottles</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-8">No wines in collection yet.</p>
                    )}
                </Card>

                {/* Best Tasting Widget */}
                <Card className="p-6 bg-slate-900/50 relative overflow-hidden group">
                    {/* Decorative background blur */}
                    <div className="absolute top-0 right-0 p-16 bg-purple-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                        <Award className="text-yellow-500" />
                        Best Wine Experience
                    </h3>

                    {stats.bestTasting ? (
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-2xl font-bold text-white">{stats.bestTasting.producer}</h4>
                                    <p className="text-lg text-slate-300">{stats.bestTasting.wineName} {stats.bestTasting.year}</p>
                                    <span className={clsx(
                                        "inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full border",
                                        "bg-purple-900/30 border-purple-700 text-purple-300"
                                    )}>
                                        {stats.bestTasting.type}
                                    </span>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-yellow-500">{stats.bestTasting.consumptionRating}</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider">Rating</div>
                                </div>
                            </div>

                            <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 backdrop-blur-sm">
                                <p className="text-slate-400 italic">"{stats.bestTasting.consumptionNotes || 'No notes provided.'}"</p>
                                <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                                    <span className={clsx(
                                        "font-medium px-2 py-1 rounded",
                                        stats.bestTasting.inStock > 0 ? "bg-emerald-900/30 text-emerald-400" : "bg-slate-900 text-slate-500"
                                    )}>
                                        {stats.bestTasting.inStock} bottles left
                                    </span>
                                    <span className="text-slate-600">
                                        Consumed {new Date(stats.bestTasting.dateConsumed!).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 relative z-10">
                            <p className="text-slate-500 mb-4">No consumption ratings yet.</p>
                            <Link to="/inventory">
                                <span className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">Drink a bottle to rate it &rarr;</span>
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
