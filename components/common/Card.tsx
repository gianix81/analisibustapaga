

import React from 'react';

interface CardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color?: 'blue' | 'green' | 'red' | 'orange';
}

const Card: React.FC<CardProps> = ({ title, value, icon, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        orange: 'bg-orange-100 text-orange-600',
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md flex items-center space-x-3">
            <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${colorClasses[color]}`}>
                {/* FIX: Cast icon to ReactElement<any> to allow adding className prop */}
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' }) : icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-lg font-bold text-gray-800">€ {value.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default Card;