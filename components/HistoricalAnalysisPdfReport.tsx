import React from 'react';
import { Payslip, HistoricalAnalysisResult } from '../types.ts';
import { LogoIcon } from './common/Icons.tsx';

interface HistoricalAnalysisPdfReportProps {
    currentPayslip: Payslip;
    analysis: HistoricalAnalysisResult;
}

const DifferenceRowPdf: React.FC<{ item: HistoricalAnalysisResult['differingItems'][0] }> = ({ item }) => {
    const diff = item.difference;
    const diffSign = diff > 0 ? '+' : '';
    const formatValue = (val: number) => `€ ${val.toFixed(2)}`;

    return (
        <tr className="border-b border-gray-200 text-sm">
            <td className="py-2 px-3 align-top">
                <p className="font-semibold text-gray-800">{item.description}</p>
                <p className="text-xs text-gray-600 italic mt-1">{item.comment}</p>
            </td>
            <td className="py-2 px-3 text-center align-top font-mono">{formatValue(item.currentValue)}</td>
            <td className="py-2 px-3 text-center align-top font-mono text-gray-700">{formatValue(item.averageValue)}</td>
            <td className={`py-2 px-3 text-center align-top font-mono font-semibold`}>{diffSign}{formatValue(diff)}</td>
        </tr>
    );
};

const HistoricalAnalysisPdfReport: React.FC<HistoricalAnalysisPdfReportProps> = ({ currentPayslip, analysis }) => {
    const getMonthName = (month: number) => new Date(2000, month - 1, 1).toLocaleString('it-IT', { month: 'long' });
    const generationDate = new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-white text-gray-800 font-sans" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'sans-serif' }}>
            <div className="p-10">
                {/* Header */}
                <header className="flex justify-between items-center pb-6 border-b-2 border-blue-600">
                    <div className="flex items-center space-x-3 text-blue-600">
                        <LogoIcon className="w-10 h-10" />
                        <span className="font-bold text-3xl">PayAnalyst</span>
                    </div>
                    <div className="text-right">
                        <h1 className="text-2xl font-bold">Analisi Storica</h1>
                        <p className="text-lg text-gray-600 capitalize">{`Confronto per ${getMonthName(currentPayslip.period.month)} ${currentPayslip.period.year}`}</p>
                    </div>
                </header>

                {/* Main Content */}
                <main className="py-8">
                    {/* AI Analysis Summary */}
                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-3">Riepilogo Analisi AI</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{analysis.summary}</p>
                        </div>
                    </section>

                    {/* Key Metrics Comparison */}
                    <section className="grid grid-cols-2 gap-6 mb-8">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-800">Stipendio Netto Corrente</p>
                            <p className="text-2xl font-bold text-green-900">€ {currentPayslip.netSalary.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg">
                             <p className="text-sm text-gray-600">Media Netto Mesi Precedenti</p>
                             <p className="text-2xl font-bold text-gray-800">€ {analysis.averageNetSalary.toFixed(2)}</p>
                        </div>
                    </section>

                    {/* Differences Table */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-3">Dettaglio Variazioni Significative</h2>
                        {analysis.differingItems.length > 0 ? (
                            <table className="w-full text-sm table-auto">
                                <thead className="bg-gray-100 text-left text-gray-600">
                                    <tr>
                                        <th className="py-2 px-3 font-semibold w-2/5">Voce e Commento AI</th>
                                        <th className="py-2 px-3 text-center font-semibold">Valore Corrente</th>
                                        <th className="py-2 px-3 text-center font-semibold">Media Precedente</th>
                                        <th className="py-2 px-3 text-center font-semibold">Differenza</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analysis.differingItems.map((item, index) => (
                                        <DifferenceRowPdf key={index} item={item} />
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">Nessuna variazione significativa trovata rispetto ai mesi precedenti.</p>
                        )}
                    </section>
                </main>

                {/* Footer */}
                <footer className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4 mt-8">
                    <p>Report generato da PayAnalyst in data {generationDate}.</p>
                    <p>Questo documento è generato automaticamente a solo scopo informativo e non sostituisce una consulenza professionale.</p>
                </footer>
            </div>
        </div>
    );
};

export default HistoricalAnalysisPdfReport;
