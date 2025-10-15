import React, { useState } from 'react';
import { Shift } from '../types.ts';
import { TrashIcon, PdfIcon, CalendarIcon } from './common/Icons.tsx';

interface ShiftPlannerProps {
    shifts: Shift[];
    onSave: (shift: Shift) => void;
    onDelete: (shiftId: string) => void;
}

const ShiftModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (shift: Shift) => void;
    onDelete?: (shiftId: string) => void;
    shift: Shift | null;
    date: string;
}> = ({ isOpen, onClose, onSave, onDelete, shift, date }) => {
    const [formData, setFormData] = useState({
        startTime: shift?.startTime || '09:00',
        endTime: shift?.endTime || '17:00',
        notes: shift?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: shift?.id || `shift-${Date.now()}`,
            date: date,
            ...formData,
        });
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">
                    {shift ? 'Modifica Turno' : 'Aggiungi Turno'} del {new Date(date).toLocaleDateString('it-IT')}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Inizio</label>
                            <input type="time" id="startTime" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Fine</label>
                            <input type="time" id="endTime" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Note</label>
                        <textarea id="notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <div>
                            {shift && onDelete && (
                                <button type="button" onClick={() => { onDelete(shift.id); onClose(); }} className="text-red-600 hover:text-red-800 font-semibold">Elimina</button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annulla</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ShiftPlanner: React.FC<ShiftPlannerProps> = ({ shifts, onSave, onDelete }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

    const handleCellClick = (date: Date, shift: Shift | undefined) => {
        setSelectedDate(date.toISOString().split('T')[0]);
        setSelectedShift(shift || null);
        setIsModalOpen(true);
    };

    const changeWeek = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + amount * 7);
            return newDate;
        });
    };

    const getWeekDays = (date: Date): Date[] => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        startOfWeek.setDate(diff);
        
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day;
        });
    };

    const weekDays = getWeekDays(currentDate);
    const shiftsByDate = shifts.reduce((acc, shift) => {
        acc[shift.date] = shift;
        return acc;
    }, {} as Record<string, Shift>);

    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];

    return (
        <div>
            <div className="flex justify-between items-center mb-6 print:hidden">
                <h1 className="text-3xl font-bold text-gray-800">Pianifica Turni</h1>
                <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    <PdfIcon className="w-5 h-5 mr-2"/> Stampa Riepilogo Settimana
                </button>
            </div>
            
            <div id="printable-shifts" className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-gray-100">&lt; Prec</button>
                    <h2 className="text-xl font-semibold text-center">
                        {weekStart.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} - {weekEnd.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-gray-100">Succ &gt;</button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className="text-center font-bold py-2 border-b-2 border-gray-200">
                           {day.toLocaleDateString('it-IT', { weekday: 'short' })}
                        </div>
                    ))}
                    {weekDays.map(day => {
                        const dateStr = day.toISOString().split('T')[0];
                        const shift = shiftsByDate[dateStr];
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;

                        return (
                            <div
                                key={dateStr}
                                onClick={() => handleCellClick(day, shift)}
                                className="border border-gray-200 rounded-lg min-h-[120px] p-2 flex flex-col cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                                <div className={`font-semibold ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                                    {day.getDate()}
                                </div>
                                {shift ? (
                                    <div className="mt-2 text-xs bg-blue-100 p-2 rounded-md text-blue-800 flex-grow">
                                        <p className="font-bold">{shift.startTime} - {shift.endTime}</p>
                                        <p className="mt-1 truncate">{shift.notes}</p>
                                    </div>
                                ) : (
                                    <div className="flex-grow"></div>
                                )}
                            </div>
                        );
                    })}
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
                    #printable-shifts {
                        box-shadow: none;
                        border: 1px solid #ccc;
                    }
                }
            `}</style>

            <ShiftModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onSave}
                onDelete={onDelete}
                shift={selectedShift}
                date={selectedDate}
            />
        </div>
    );
};

export default ShiftPlanner;