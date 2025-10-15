import React from 'react';
import { NAV_ITEMS } from '../constants.tsx';
import { View } from '../types.ts';
import { CloseIcon, LogoIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from './common/Icons.tsx';

interface SidebarProps {
    isOpen: boolean; // for mobile
    setIsOpen: (isOpen: boolean) => void;
    isCollapsed: boolean; // for desktop
    setIsCollapsed: (isCollapsed: boolean) => void;
    currentView: View;
    setCurrentView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, currentView, setCurrentView }) => {
    const handleNavigation = (view: View) => {
        setCurrentView(view);
        setIsOpen(false); // Close mobile overlay on navigation
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity md:hidden ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Main Sidebar */}
            <aside
                className={`fixed top-0 left-0 bg-white h-full shadow-lg z-30 flex flex-col transform transition-all duration-300 ease-in-out 
                    md:relative md:shadow-none md:translate-x-0
                    w-64
                    ${ isCollapsed ? 'md:w-20' : 'md:w-64' }
                    ${ isOpen ? 'translate-x-0' : '-translate-x-full' }`}
            >
                {/* Header */}
                <div className={`flex items-center border-b border-gray-200 h-[65px] px-4 ${isCollapsed && 'md:px-0 md:justify-center'}`}>
                     <div className="flex items-center space-x-2 text-blue-600 overflow-hidden">
                        <LogoIcon />
                        <span className={`font-bold text-xl whitespace-nowrap ${isCollapsed && 'md:hidden'}`}>PayAnalyst</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className={`text-gray-500 hover:text-blue-600 md:hidden ${isCollapsed && 'hidden'}`}>
                        <CloseIcon />
                    </button>
                </div>
                
                {/* Navigation */}
                <nav className="mt-6 flex-1">
                    <ul>
                        {NAV_ITEMS.map((item) => (
                            <li key={item.id} className="px-4 md:px-2 mb-2">
                                <a
                                    href="#"
                                    title={item.label}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavigation(item.id);
                                    }}
                                    className={`flex items-center p-3 rounded-lg transition-colors group relative
                                        ${ isCollapsed && 'md:justify-center' }
                                        ${ currentView === item.id
                                            ? 'bg-blue-50 text-blue-600 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="flex-shrink-0">{item.icon}</div>
                                    <span className={`ml-3 whitespace-nowrap ${isCollapsed && 'md:hidden'}`}>{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                
                {/* Footer and Toggle */}
                <div className="border-t border-gray-200">
                     <div className={`p-4 transition-all duration-300 ${isCollapsed ? 'md:opacity-0 md:h-0 md:p-0 md:invisible' : 'opacity-100'}`}>
                        <div className="p-4 bg-gray-100 rounded-lg text-center">
                           <p className="text-sm text-gray-600">I tuoi dati sono crittografati e al sicuro.</p>
                        </div>
                    </div>

                    <div className="hidden md:flex justify-center p-2">
                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="w-full flex items-center justify-center p-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label={isCollapsed ? "Espandi menu" : "Comprimi menu"}
                        >
                           {isCollapsed ? <ChevronDoubleRightIcon /> : <ChevronDoubleLeftIcon />}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;