import React, { useState, useEffect } from 'react';
import { Payslip } from '../types.ts';
import { CalendarIcon, AssistantIcon } from './common/Icons.tsx';
import { getComparisonAnalysis } from '../services/geminiService.ts';
import Spinner from './common/Spinner.tsx';
import Assistant from './Assistant.tsx';

interface CompareProps {
    payslips: [Payslip, Payslip] | null;
}

const Compare: React.FC<CompareProps> = ({ payslips }) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const getMonthName = (month: number) => new Date(2000, month - 1, 1).toLocaleString('it-IT', { month: 'long' });
    
    useEffect(() => {
        if (payslips) {
            const [p1, p2] = payslips;
            setIsAnalysisLoading(true);
            setAnalysis(null);
            setAnalysisError(null);

            getComparisonAnalysis(p1, p2)
                .then(result => {
                    setAnalysis(result);
                })
                .catch(err => {
                    console.error("Analysis failed:", err);
                    setAnalysisError("Impossibile generare l'analisi comparativa. Riprova più tardi.");
                })
                .finally(() => {
                    setIsAnalysisLoading(false);
                });
        }
    }, [payslips]);

    if (!payslips) {
        return (
            <div className="text-center p-8 bg-white rounded-xl shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Seleziona Buste Paga</h1>
                <p className="text-gray-600">Vai all'archivio per selezionare due buste paga da confrontare.</p>
            </div>
        );
    }
    
    const [p1, p2] = payslips;

    const ComparisonRow: React.FC<{ label: string, val1: number, val2: number, isCurrency?: boolean }> = ({ label, val1, val2, isCurrency = true }) => {
        const diff = val2 - val1;
        const diffColor = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500';
        const diffSign = diff > 0 ? '+' : '';
        const formatValue = (val: number) => isCurrency ? `€ ${val.toFixed(2)}` : val.toFixed(2);

        return (
            <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-700">{label}</td>
                <td className="py-3 px-4 text-center font-mono">{formatValue(val1)}</td>
                <td className="py-3 px-4 text-center font-mono">{formatValue(val2)}</td>
                <td className={`py-3 px-4 text-center font-mono font-semibold ${diffColor}`}>{diffSign}{formatValue(diff)}</td>
            </tr>
        )
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Confronto Buste Paga</h1>
            
            {/* AI Analysis Section */}
            <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <AssistantIcon className="mr-2 text-blue-500"/>
                    Analisi AI
                </h2>
                {isAnalysisLoading && (
                    <div className="flex items-center space-x-2 text-gray-600">
                        <Spinner />
                        <span>Sto analizzando le differenze...</span>
                    </div>
                )}
                {analysisError && <p className="text-red-600">{analysisError}</p>}
                {analysis && <p className="text-gray-700 whitespace-pre-wrap">{analysis}</p>}
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <table className="w-full text-sm">
                    <thead className="sticky top-0">
                        <tr className="bg-gray-100 text-left text-gray-600">
                            <th className="py-3 px-4 font-semibold">Voce</th>
                            <th className="py-3 px-4 text-center font-semibold">
                                <div className="flex items-center justify-center">
                                    <CalendarIcon className="mr-2"/>
                                    <span className="capitalize">{getMonthName(p1.period.month)} {p1.period.year}</span>
                                </div>
                            </th>
                            <th className="py-3 px-4 text-center font-semibold">
                                <div className="flex items-center justify-center">
                                    <CalendarIcon className="mr-2"/>
                                    <span className="capitalize">{getMonthName(p2.period.month)} {p2.period.year}</span>
                                </div>
                            </th>
                            <th className="py-3 px-4 text-center font-semibold">Differenza</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <tr className="bg-blue-50"><td colSpan={4} className="py-2 px-4 font-bold text-blue-800">Riepilogo</td></tr>
                        <ComparisonRow label="Stipendio Lordo" val1={p1.grossSalary} val2={p2.grossSalary} />
                        <ComparisonRow label="Stipendio Netto" val1={p1.netSalary} val2={p2.netSalary} />
                        <ComparisonRow label="Trattenute Totali" val1={p1.totalDeductions} val2={p2.totalDeductions} />
                        
                        <tr className="bg-gray-50"><td colSpan={4} className="py-2 px-4 font-bold text-gray-500">Dettaglio Fiscale</td></tr>
                        <ComparisonRow label="Imponibile Fiscale" val1={p1.taxData.taxableBase} val2={p2.taxData.taxableBase} />
                        <ComparisonRow label="Imposta Lorda" val1={p1.taxData.grossTax} val2={p2.taxData.grossTax} />
                        <ComparisonRow label="Detrazioni Totali" val1={p1.taxData.deductions.total} val2={p2.taxData.deductions.total} />
                        <ComparisonRow label="Imposta Netta" val1={p1.taxData.netTax} val2={p2.taxData.netTax} />
                        
                        <tr className="bg-gray-50"><td colSpan={4} className="py-2 px-4 font-bold text-gray-500">Dettaglio Previdenziale</td></tr>
                        <ComparisonRow label="Imponibile Previdenziale" val1={p1.socialSecurityData.taxableBase} val2={p2.socialSecurityData.taxableBase} />
                        <ComparisonRow label="Contributi Dipendente" val1={p1.socialSecurityData.employeeContribution} val2={p2.socialSecurityData.employeeContribution} />
                       
                        <tr className="bg-gray-50"><td colSpan={4} className="py-2 px-4 font-bold text-gray-500">TFR</td></tr>
                        <ComparisonRow label="TFR Maturato" val1={p1.tfr.accrued} val2={p2.tfr.accrued} />
                         <ComparisonRow label="Fondo TFR Totale" val1={p1.tfr.totalFund} val2={p2.tfr.totalFund} />

                        <tr className="bg-gray-50"><td colSpan={4} className="py-2 px-4 font-bold text-gray-500">Ferie & Permessi</td></tr>
                        <ComparisonRow label="Saldo Ferie" val1={p1.leaveData.vacation.balance} val2={p2.leaveData.vacation.balance} isCurrency={false} />
                        <ComparisonRow label="Saldo Permessi" val1={p1.leaveData.permits.balance} val2={p2.leaveData.permits.balance} isCurrency={false} />
                    </tbody>
                </table>
            </div>

            {/* Contextual Assistant Section */}
            <div className="mt-8">
                 <Assistant mode="contextual" payslips={[]} payslipsToCompare={payslips} />
            </div>
        </div>
    );
};

export default Compare;