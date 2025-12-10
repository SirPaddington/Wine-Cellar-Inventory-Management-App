
import React from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { Button } from '../ui/Button';
import { Edit2, Move, Wine as WineIcon, X } from 'lucide-react';

interface BottleActionMenuProps {
    bottleId: string;
    onClose: () => void;
    onEditWine: (wineId: string) => void;
    onMoveBottle: (bottleId: string) => void;
    onConsumeBottle: (bottleId: string) => void;
}

export const BottleActionMenu: React.FC<BottleActionMenuProps> = ({
    bottleId,
    onClose,
    onEditWine,
    onMoveBottle,
    onConsumeBottle
}) => {
    const bottle = useInventoryStore(state => state.bottles.find(b => b.id === bottleId));
    const wine = useInventoryStore(state => state.getWine(bottle?.wineId || ''));

    if (!bottle) return <div className="p-6 text-red-400">Bottle not found: {bottleId}</div>;
    if (!wine) return <div className="p-6 text-red-400">Wine details not found</div>;

    return (
        <div className="h-full flex flex-col text-slate-100">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-700">
                <div>
                    <h3 className="text-xl font-bold text-white leading-tight mb-1">{wine.producer}</h3>
                    <p className="text-indigo-400 font-medium">{wine.name}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Info Card */}
            <div className="space-y-6">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                        <span className="text-slate-400">Vintage</span>
                        <span className="text-white font-semibold text-lg">{wine.year}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Type</span>
                        <span className="text-white">{wine.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Varietal</span>
                        <span className="text-white">{wine.varietal}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                        <span className="text-slate-400">Added</span>
                        <span className="text-white">{new Date(bottle.dateAdded).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => onEditWine(wine.id)}
                        className="w-full justify-center py-6 text-base"
                    >
                        <Edit2 size={18} className="mr-2" />
                        Edit Details
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={() => onMoveBottle(bottleId)}
                        className="w-full justify-center py-6 text-base"
                    >
                        <Move size={18} className="mr-2" />
                        Move Bottle
                    </Button>

                    <div className="h-px bg-slate-700 my-2" />

                    <Button
                        onClick={() => onConsumeBottle(bottleId)}
                        className="w-full justify-center bg-purple-600 hover:bg-purple-700 py-6 text-base shadow-lg shadow-purple-900/20"
                    >
                        <WineIcon size={18} className="mr-2" />
                        Drink This Bottle
                    </Button>
                </div>
            </div>
        </div>
    );
};
