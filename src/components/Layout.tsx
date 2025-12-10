import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wine, Cuboid as Cube, Settings, LogOut, Menu, X } from 'lucide-react';
import clsx from 'clsx';

const NavItem = ({ to, icon: Icon, children, onClick }: { to: string; icon: React.ComponentType<any>; children: React.ReactNode; onClick?: () => void }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors whitespace-nowrap',
                isActive ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            )
        }
    >
        <Icon size={20} className="min-w-[20px]" />
        <span className="font-medium">{children}</span>
    </NavLink>
);

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans overflow-hidden">
            {/* Sidebar - Collapsible */}
            <aside
                className={clsx(
                    "flex-shrink-0 bg-neutral-950 border-r border-neutral-800 flex flex-col transition-all duration-300 ease-in-out overflow-hidden h-full",
                    isMenuOpen ? "w-64 opacity-100" : "w-0 opacity-0"
                )}
            >
                <div className="w-64 flex flex-col h-full p-6 pt-20">
                    <div className="mb-8">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            VinoVault
                        </h1>
                        <p className="text-xs text-neutral-500 mt-1">Personal Cellar Manager</p>
                    </div>

                    <nav className="flex-1 space-y-1">
                        <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>
                        <NavItem to="/inventory" icon={Wine}>Inventory</NavItem>
                        <NavItem to="/consumption" icon={LogOut}>Consumed</NavItem>
                        <NavItem to="/cellar" icon={Cube}>3D Cellar</NavItem>
                        <NavItem to="/configuration" icon={Settings}>Configuration</NavItem>
                    </nav>

                    <div className="pt-4 border-t border-neutral-800">
                        <button className="flex items-center gap-3 px-3 py-2 w-full text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap">
                            <LogOut size={20} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative flex flex-col h-full bg-neutral-950">
                {/* Burger Button - Moves with content because it's in the flex item */}
                <div className="absolute top-4 left-4 z-50">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 shadow-lg border border-neutral-800"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <div className="h-full w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};
