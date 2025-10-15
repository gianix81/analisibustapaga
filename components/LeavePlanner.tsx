import React, { useState } from 'react';
import { LeavePlan } from '../types.ts';
import { TrashIcon, PdfIcon, CalendarIcon } from './common/Icons.tsx';

interface LeavePlannerProps {
    leavePlans: LeavePlan[];
    onSave: (plan: LeavePlan) => void;
    onDelete: (planId: string) => void;
}

const LeaveModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (plan: LeavePlan) => void;
    plan: LeavePlan | null;
}> = ({ isOpen, onClose, onSave, plan }) => {
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        type: plan?.type || 'Ferie',
        startDate: plan?.startDate || today,
        endDate: plan?.endDate || today,
        notes: plan?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: plan?.id || `leave-${Date.now()}`,
            ...formData,
        } as LeavePlan);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">{plan ? 'Modifica Periodo' : 'Programma Ferie/ROL'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as 'Ferie' | 'ROL'})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            <option>Ferie</option>
                            <option>ROL</option>
                        </select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data Inizio</label>
                            <input type="date" id="startDate" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data Fine</label>
                            <input type="date" id="endDate" min={formData.startDate} value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Note</label>
                        <textarea id="notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const LeavePlanner: React.FC<LeavePlannerProps> = ({ leavePlans, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<LeavePlan | null>(null);

    const handleEdit = (plan: LeavePlan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };
    
    const handleAddNew = () => {
        setSelectedPlan(null);
        setIsModalOpen(true);
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
    
    const sortedPlans = [...leavePlans].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6 print:hidden">
                <h1 className="text-3xl font-bold text-gray-800">Pianifica Ferie e ROL</h1>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                        <PdfIcon className="w-5 h-5 mr-2"/> Stampa Riepilogo
                    </button>
                    <button onClick={handleAddNew} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        + Aggiungi Periodo
                    </button>
                </div>
            </div>

            <div id="printable-leave">
                <div className="hidden print:block mb-4">
                    <h2 className="text-2xl font-bold">Riepilogo Ferie e ROL Programmati</h2>
                    <p className="text-sm text-gray-600">Report generato il {new Date().toLocaleDateString('it-IT')}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md">
                    {sortedPlans.length === 0 ? (
                        <p className="text-center text-gray-500 p-8">Nessun periodo di ferie o ROL programmato.</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                           {sortedPlans.map(plan => (
                               <li key={plan.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                   <div className="flex-1">
                                       <div className="flex items-center gap-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${plan.type === 'Ferie' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{plan.type}</span>
                                            <p className="font-semibold text-gray-800">
                                                {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                                            </p>
                                       </div>
                                       {plan.notes && <p className="text-sm text-gray-600 mt-1 ml-2 pl-1 border-l-2 border-gray-200">{plan.notes}</p>}
                                   </div>
                                   <div className="flex items-center gap-2 print:hidden">
                                        <button onClick={() => handleEdit(plan)} className="px-3 py-1 text-sm bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">Modifica</button>
                                        <button onClick={() => onDelete(plan.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full"><TrashIcon/></button>
                                   </div>
                               </li>
                           ))}
                        </ul>
                    )}
                </div>
            </div>
             {/* FIX: Replaced non-standard <style jsx> with a standard <style> tag. */}
             <style>{`
                @media print {
                    body {
                        background-color: white;
                    }
                    .print\\:hidden {
                        display: none;
                    }
                    #printable-leave {
                        box-shadow: none;
                    }
                     #printable-leave .bg-white {
                        box-shadow: none;
                        border: 1px solid #ccc;
                    }
                }
            `}</style>
             <LeaveModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onSave}
                plan={selectedPlan}
            />
        </div>
    );
};

export default LeavePlanner;