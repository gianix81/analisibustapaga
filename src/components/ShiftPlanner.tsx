import React, { useState, useMemo, useEffect } from 'react';
import { Shift, Absence, TimeInterval, AbsenceReason, ABSENCE_REASONS } from '../types.ts';
import { TrashIcon, PdfIcon } from './common/Icons.tsx';

interface PlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveShift: (shift: Shift) => void;
    onDeleteShift: (shiftId: string) => void;
    onSaveAbsence: (absence: Absence) => void;
    onDeleteAbsence: (absenceId: string) => void;
    entry: Shift | Absence | null;
    date: string;
}

const PlannerModal: React.FC<PlannerModalProps> = ({ isOpen, onClose, onSaveShift, onDeleteShift, onSaveAbsence, onDeleteAbsence, entry, date }) => {
    const isEditing = !!entry;
    const getEntryType = () => {
        if (!entry) return 'shift';
        return 'intervals' in entry ? 'shift' : 'absence';
    };

    const [activeTab, setActiveTab] = useState<'shift' | 'absence'>(getEntryType());

    // Shift State
    const [intervals, setIntervals] = useState<TimeInterval[]>([]);
    const [shiftNotes, setShiftNotes] = useState('');
    
    // Absence State
    const [reason, setReason] = useState<AbsenceReason>('Ferie');
    const [absenceNotes, setAbsenceNotes] = useState('');

    useEffect(() => {
        if(isOpen) {
            const type = getEntryType();
            setActiveTab(type);
             if (type === 'shift') {
                setIntervals(entry ? (entry as Shift).intervals : [{ id: `int-${Date.now()}`, startTime: '09:00', endTime: '17:00' }]);
                setShiftNotes(entry ? (entry as Shift).notes || '' : '');
            } else {
                setReason(entry ? (entry as Absence).reason : 'Ferie');
                setAbsenceNotes(entry ? (entry as Absence).notes || '' : '');
            }
        }
    }, [isOpen, entry]);


    const handleIntervalChange = (id: string, field: 'startTime' | 'endTime', value: string) => {
        setIntervals(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const addInterval = () => {
        const lastInterval = intervals[intervals.length - 1];
        const newStartTime = lastInterval ? lastInterval.endTime : '13:00';
        // Simple logic to suggest a 1-hour break
        const newEndTimeSuggestion = lastInterval ? `${(parseInt(lastInterval.endTime.split(':')[0]) + 1).toString().padStart(2, '0')}:${lastInterval.endTime.split(':')[1]}` : '14:00';
        setIntervals(prev => [...prev, { id: `int-${Date.now()}`, startTime: newStartTime, endTime: newEndTimeSuggestion }]);
    };
    
    const removeInterval = (id: string) => {
        if (intervals.length > 1) {
            setIntervals(prev => prev.filter(i => i.id !== id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === 'shift') {
            const shiftId = (entry && 'intervals' in entry) ? entry.id : `shift-${Date.now()}`;
            onSaveShift({
                id: shiftId,
                date,
                intervals,
                notes: shiftNotes,
            });
        } else {
            const absenceId = (entry && 'reason' in entry) ? entry.id : `absence-${Date.now()}`;
            onSaveAbsence({
                id: absenceId,
                date,
                reason,
                notes: absenceNotes,
            });
        }
        onClose();
    };

    const handleDelete = () => {
        if (entry) {
            if ('intervals' in entry) {
                onDeleteShift(entry.id);
            } else {
                onDeleteAbsence(entry.id);
            }
            onClose();
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">
                    {isEditing ? 'Modifica' : 'Aggiungi'} evento del {new Date(date + 'T00:00:00').toLocaleDateString('it-IT', {day: '2-digit', month: 'long', year: 'numeric'})}
                </h2>
                
                {!isEditing && (
                    <div className="flex border-b mb-4">
                        <button onClick={() => setActiveTab('shift')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'shift' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Turno</button>
                        <button onClick={() => setActiveTab('absence')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'absence' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>Assenza</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'shift' ? (
                        <>
                            {intervals.map((interval, index) => (
                                <div key={interval.id} className="flex items-center gap-2">
                                    <div className="grid grid-cols-2 gap-2 flex-grow">
                                        <div>
                                            <label htmlFor={`startTime-${interval.id}`} className="block text-xs font-medium text-gray-700">Inizio</label>
                                            <input type="time" id={`startTime-${interval.id}`} value={interval.startTime} onChange={e => handleIntervalChange(interval.id, 'startTime', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                        </div>
                                        <div>
                                            <label htmlFor={`endTime-${interval.id}`} className="block text-xs font-medium text-gray-700">Fine</label>
                                            <input type="time" id={`endTime-${interval.id}`} value={interval.endTime} onChange={e => handleIntervalChange(interval.id, 'endTime', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => removeInterval(interval.id)} disabled={intervals.length <= 1} className="p-2 text-gray-400 hover:text-red-600 mt-5 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            ))}
                             <button type="button" onClick={addInterval} className="text-sm text-blue-600 font-semibold hover:underline">+ Aggiungi intervallo (pausa)</button>
                             <div>
                                <label htmlFor="shiftNotes" className="block text-sm font-medium text-gray-700">Note</label>
                                <textarea id="shiftNotes" value={shiftNotes} onChange={e => setShiftNotes(e.target.value)} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Giustificativo</label>
                                <select id="reason" value={reason} onChange={e => setReason(e.target.value as AbsenceReason)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                    {ABSENCE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="absenceNotes" className="block text-sm font-medium text-gray-700">Note</label>
                                <textarea id="absenceNotes" value={absenceNotes} onChange={e => setAbsenceNotes(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between items-center pt-2">
                        <div>
                            {isEditing && (
                                <button type="button" onClick={handleDelete} className="text-red-600 hover:text-red-800 font-semibold">Elimina</button>
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

interface ShiftPlannerProps {
    shifts: Shift[];
    onSave: (shift: Shift) => void;
    onDelete: (shiftId: string) => void;
    absences: Absence[];
    onSaveAbsence: (absence: Absence) => void;
    onDeleteAbsence: (absenceId: string) => void;
}

const ShiftPlanner: React.FC<ShiftPlannerProps> = ({ shifts, onSave, onDelete, absences, onSaveAbsence, onDeleteAbsence }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedEntry, setSelectedEntry] = useState<Shift | Absence | null>(null);

    const entriesByDate = useMemo(() => {
        const map: Record<string, Shift | Absence> = {};
        shifts.forEach(s => { map[s.date] = s; });
        absences.forEach(a => { map[a.date] = a; });
        return map;
    }, [shifts, absences]);

    const handleCellClick = (date: Date, entry: Shift | Absence | undefined) => {
        setSelectedDate(date.toISOString().split('T')[0]);
        setSelectedEntry(entry || null);
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
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        
        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day;
        });
    };

    const weekDays = getWeekDays(currentDate);
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];

    const ABSENCE_COLORS: Record<AbsenceReason, string> = {
        'Ferie': 'bg-green-100 text-green-800',
        'ROL': 'bg-teal-100 text-teal-800',
        'Permesso Speciale': 'bg-cyan-100 text-cyan-800',
        'Malattia': 'bg-orange-100 text-orange-800',
        'Legge 104': 'bg-purple-100 text-purple-800',
        'Riposo': 'bg-gray-200 text-gray-800',
        'Altro': 'bg-indigo-100 text-indigo-800',
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 print:hidden">
                <h1 className="text-3xl font-bold text-gray-800">Pianifica Turni e Assenze</h1>
                <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    <PdfIcon className="w-5 h-5 mr-2"/> Stampa Riepilogo Settimana
                </button>
            </div>
            
            <div id="printable-shifts" className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4 print:hidden">
                    <button onClick={() => changeWeek(-1)} className="px-3 py-1 rounded-md hover:bg-gray-100 font-semibold text-gray-600">&lt; Prec</button>
                    <h2 className="text-xl font-semibold text-center">
                        {weekStart.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} - {weekEnd.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </h2>
                    <button onClick={() => changeWeek(1)} className="px-3 py-1 rounded-md hover:bg-gray-100 font-semibold text-gray-600">Succ &gt;</button>
                </div>
                 <div className="hidden print:block mb-4 text-center">
                     <h2 className="text-xl font-semibold">Riepilogo Settimana</h2>
                     <p>{weekStart.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })} - {weekEnd.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>

                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className="text-center font-bold py-2 border-b-2 border-gray-200 text-sm md:text-base">
                           {day.toLocaleDateString('it-IT', { weekday: 'short' })}
                        </div>
                    ))}
                    {weekDays.map(day => {
                        const dateStr = day.toISOString().split('T')[0];
                        const entry = entriesByDate[dateStr];
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;

                        return (
                            <div
                                key={dateStr}
                                onClick={() => handleCellClick(day, entry)}
                                className="border border-gray-200 rounded-lg min-h-[120px] p-1.5 flex flex-col cursor-pointer hover:bg-blue-50 transition-colors"
                            >
                                <div className={`font-semibold text-sm ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                                    {day.getDate()}
                                </div>
                                {entry ? (
                                    'intervals' in entry ? ( // It's a Shift
                                        <div className="mt-1 text-xs bg-blue-100 p-2 rounded-md text-blue-800 flex-grow space-y-1">
                                            {entry.intervals.map(i => (
                                                <p key={i.id} className="font-bold">{i.startTime} - {i.endTime}</p>
                                            ))}
                                            <p className="mt-1 truncate italic">{entry.notes}</p>
                                        </div>
                                    ) : ( // It's an Absence
                                         <div className={`mt-1 text-xs p-2 rounded-md flex-grow flex flex-col justify-center items-center text-center ${ABSENCE_COLORS[entry.reason]}`}>
                                            <p className="font-bold">{entry.reason}</p>
                                            <p className="mt-1 truncate italic">{entry.notes}</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex-grow"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            
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

            <PlannerModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaveShift={onSave}
                onDeleteShift={onDelete}
                onSaveAbsence={onSaveAbsence}
                onDeleteAbsence={onDeleteAbsence}
                entry={selectedEntry}
                date={selectedDate}
            />
        </div>
    );
};

export default ShiftPlanner;