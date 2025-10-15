import React, { useState } from 'react';
import { Payslip } from '../types.ts';
import { EuroIcon, TrashIcon } from './common/Icons.tsx';

interface ArchiveProps {
    payslips: Payslip[];
    onSelectPayslip: (payslip: Payslip) => void;
    onCompare: (payslips: [Payslip, Payslip]) => void;
    onDeletePayslip: (payslipId: string) => void;
}

const Archive: React.FC<ArchiveProps> = ({ payslips, onSelectPayslip, onCompare, onDeletePayslip }) => {
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
    
    const toggleCompareSelection = (payslipId: string) => {
        setSelectedForCompare(prev => {
            if (prev.includes(payslipId)) {
                return prev.filter(id => id !== payslipId);
            }
            if (prev.length < 2) {
                return [...prev, payslipId];
            }
            return [prev[1], payslipId]; // keep last two
        });
    };

    const handleCompareClick = () => {
        if (selectedForCompare.length === 2) {
            const payslipsToCompare = payslips.filter(p => selectedForCompare.includes(p.id));
            if (payslipsToCompare.length === 2) {
                onCompare([payslipsToCompare[0], payslipsToCompare[1]]);
            }
        }
    };
    
    const getMonthName = (month: number) => new Date(2000, month - 1, 1).toLocaleString('it-IT', { month: 'long' });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Archivio Buste Paga</h1>
                <button 
                    onClick={handleCompareClick}
                    disabled={selectedForCompare.length !== 2}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                    Confronta Selezionati ({selectedForCompare.length}/2)
                </button>
            </div>
            
            {payslips.length === 0 ? (
                <p className="text-center text-gray-500 mt-8">Nessuna busta paga in archivio.</p>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {payslips.map(p => (
                            <li key={p.id} className="p-4 flex flex-col md:flex-row items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
                                    <input
                                        type="checkbox"
                                        id={`compare-${p.id}`}
                                        name={`compare-${p.id}`}
                                        aria-label={`Seleziona per confronto: ${getMonthName(p.period.month)} ${p.period.year}`}
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={selectedForCompare.includes(p.id)}
                                        onChange={() => toggleCompareSelection(p.id)}
                                    />
                                    <div className="ml-4 flex-grow cursor-pointer" onClick={() => onSelectPayslip(p)}>
                                        <p className="font-bold text-lg text-gray-800 capitalize">
                                            {getMonthName(p.period.month)} {p.period.year}
                                        </p>
                                        <p className="text-sm text-gray-500">{p.company.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 w-full md:w-auto justify-between">
                                     <div className="flex items-center text-green-600">
                                        <EuroIcon className="w-5 h-5"/>
                                        <span className="font-semibold text-lg ml-2">{p.netSalary.toFixed(2)}</span>
                                     </div>
                                    <button 
                                        onClick={() => onSelectPayslip(p)}
                                        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Visualizza
                                    </button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); onDeletePayslip(p.id); }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                        aria-label="Elimina busta paga"
                                     >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Archive;