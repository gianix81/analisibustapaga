
import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );
};

export default Spinner;