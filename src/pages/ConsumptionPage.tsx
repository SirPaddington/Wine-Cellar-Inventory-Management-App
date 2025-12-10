import React from 'react';
import { ConsumptionHistory } from '../components/Inventory/ConsumptionHistory';

export const ConsumptionPage: React.FC = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto pt-20 lg:pt-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Consumption History</h1>
                <p className="text-neutral-400">Track your enjoyed wines.</p>
            </div>

            <ConsumptionHistory />
        </div>
    );
};
