import React from 'react';
import { WineTable } from '../components/Inventory/WineTable';

const InventoryPage: React.FC = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto pt-20 lg:pt-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">My Collection</h1>
                <p className="text-neutral-400">Manage your wines and inventory.</p>
            </div>

            <WineTable />
        </div>
    );
};

export default InventoryPage;
