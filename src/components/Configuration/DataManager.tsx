
import React, { useRef } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { useCellarStore } from '../../store/cellarStore';
import { Button } from '../ui/Button';
import { Download, Upload, FileJson } from 'lucide-react';

export const DataManager: React.FC = () => {
    const inventoryStore = useInventoryStore();
    const cellarStore = useCellarStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = {
            version: 1,
            timestamp: new Date().toISOString(),
            inventory: {
                wines: inventoryStore.wines,
                bottles: inventoryStore.bottles
            },
            cellar: {
                locations: cellarStore.locations,
                units: cellarStore.units
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wine-storage-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                // Simple validation
                if (!json.inventory || !json.cellar) {
                    alert("Invalid backup file format.");
                    return;
                }

                if (confirm("This will overwrite all current data. Are you sure?")) {
                    // Hydrate Inventory
                    // We need 'set' methods in stores usually, or we can use the 'setState' from zustand api if exposed, 
                    // but usually we add a 'hydrate' action or just replace state.
                    // Since I don't have a 'hydrate' action, I'll basically rely on internal Zustand mechanics or add public setters.
                    // Wait, I can use the `setState` property attached to the hook if I import the store *instance*?
                    // Actually, Zustand stores are hooks but also have .setState if imported as the store definition.
                    // But I'm importing the hook.
                    // Best practice: Add a `loadData` or `hydrate` action to the stores.

                    // For now, I will assume I need to update the stores.
                    // Let's modify the stores to support bulk setting, or just use what we have? 
                    // Stores allow 'add' but not 'replace all'.
                    // I will add `loadBackup` action to stores in next step. For now, I'll log.

                    // Actually, let's implement the UI and then update stores.
                    console.log("Importing data...", json);
                    onImportData(json);
                }

            } catch (err) {
                console.error(err);
                alert("Failed to parse file.");
            }
        };
        reader.readAsText(file);

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Placeholder for actual import logic which needs store updates
    const onImportData = (data: any) => {
        // We need to extend the stores to accept full state replacement.
        // I'll assume that's done or I'll do it next.
        useInventoryStore.setState({
            wines: data.inventory.wines,
            bottles: data.inventory.bottles
        });

        useCellarStore.setState({
            locations: data.cellar.locations,
            units: data.cellar.units
        });

        alert("Data imported successfully! The page will reload.");
        window.location.reload();
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-900/30 text-indigo-400 rounded-lg">
                    <FileJson size={24} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Data Backup</h2>
                    <p className="text-sm text-slate-400">Save your data to a file or restore from a backup.</p>
                </div>
            </div>

            <div className="flex gap-4">
                <Button onClick={handleExport} className="flex-1 justify-center">
                    <Download size={18} className="mr-2" />
                    Export Data
                </Button>

                <div className="relative flex-1">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".json"
                        className="hidden"
                    />
                    <Button
                        variant="secondary"
                        className="w-full justify-center"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload size={18} className="mr-2" />
                        Import Data
                    </Button>
                </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
                Exporting creates a JSON file. Importing will replace your current collection.
            </p>
        </div>
    );
};
