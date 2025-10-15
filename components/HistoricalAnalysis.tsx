import React, { useState, useEffect, useRef } from 'react';
import { Payslip } from '../types.ts';
import { getHistoricalAnalysis } from '../services/geminiService.ts';
import { HistoricalAnalysisResult } from '../types.ts';
import Spinner from './common/Spinner.tsx';
import { AssistantIcon, TrendingUpIcon, PdfIcon } from './common/Icons.tsx';
import HistoricalAnalysisPdfReport from './HistoricalAnalysisPdfReport.tsx';

// TypeScript declarations for CDN libraries
declare const jspdf: any;
declare const html2canvas: any;

interface HistoricalAnalysisProps {
    currentPayslip: Payslip;
    allPayslips: Payslip[];
}

const DifferenceRow: React.FC<{ item: HistoricalAnalysisResult['differingItems'][0] }> = ({ item }) => {
    const diff = item.difference;
    const diffColor = diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-500';
    const diffSign = diff > 0 ? '+' : '';
    const formatValue = (val: number) => `€ ${val.toFixed(2)}`;

    return (
        <tr className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50">
            <td className="py-3 px-4">
                <p className="font-semibold text-gray-800">{item.description}</p>
                <p className="text-xs text-gray-500 italic">{item.comment}</p>
            </td>
            <td className="py-3 px-4 text-center font-mono">{formatValue(item.currentValue)}</td>
            <td className="py-3 px-4 text-center font-mono text-gray-600">{formatValue(item.averageValue)}</td>
            <td className={`py-3 px-4 text-center font-mono font-semibold ${diffColor}`}>{diffSign}{formatValue(diff)}</td>
        </tr>
    );
};


const HistoricalAnalysis: React.FC<HistoricalAnalysisProps> = ({ currentPayslip, allPayslips }) => {
    const [analysis, setAnalysis] = useState<HistoricalAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const pdfReportRef = useRef<HTMLDivElement>(null);

    const historicalPayslips = allPayslips.filter(p => p.id !== currentPayslip.id);

    useEffect(() => {
        if (historicalPayslips.length === 0) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        getHistoricalAnalysis(currentPayslip, historicalPayslips)
            .then(result => {
                setAnalysis(result);
            })
            .catch(err => {
                console.error("Historical analysis failed:", err);
                setError("Impossibile generare l'analisi storica. Riprova più tardi.");
            })
            .finally(() => {
                setIsLoading(false);
            });

    }, [currentPayslip.id]);

    useEffect(() => {
        if (!isGeneratingPdf || !analysis || !pdfReportRef.current) return;

        if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') {
            console.error("jsPDF or html2canvas is not loaded");
            setIsGeneratingPdf(false);
            return;
        }

        const { jsPDF } = jspdf;
        const getMonthName = (month: number) => new Date(2000, month - 1, 1).toLocaleString('it-IT', { month: 'long' });

        html2canvas(pdfReportRef.current, { scale: 2 })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const canvasHeight = canvas.height;
                const canvasWidth = canvas.width;
                const imgHeight = canvasHeight * pdfWidth / canvasWidth;
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                pdf.save(`Analisi-Storica-${getMonthName(currentPayslip.period.month)}-${currentPayslip.period.year}.pdf`);
            })
            .catch(err => {
                console.error("Error generating historical analysis PDF", err);
            })
            .finally(() => {
                setIsGeneratingPdf(false);
            });
    }, [isGeneratingPdf, analysis, currentPayslip]);

    const handleExportPdf = () => {
        if (!analysis || isGeneratingPdf) return;
        setIsGeneratingPdf(true);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-md min-h-[400px]">
                <Spinner />
                <p className="mt-4 font-semibold text-blue-600">Analisi dello storico in corso...</p>
                <p className="text-gray-500">Confronto la busta paga attuale con quelle precedenti.</p>
            </div>
        );
    }
    
    if (error) {
         return <div className="text-center p-8 bg-red-50 text-red-700 rounded-xl shadow-md">{error}</div>;
    }

    if (historicalPayslips.length === 0 || !analysis) {
        return (
            <div className="text-center p-12 bg-white rounded-xl shadow-md min-h-[400px] flex items-center justify-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-700">Dati insufficienti per un'analisi</h2>
                    <p className="text-gray-500 mt-2">Carica almeno un'altra busta paga per attivare il confronto storico.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
             {isGeneratingPdf && analysis && (
                <div ref={pdfReportRef} style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -10 }}>
                    <HistoricalAnalysisPdfReport currentPayslip={currentPayslip} analysis={analysis} />
                </div>
            )}
            {/* AI Summary Section */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <AssistantIcon className="mr-2 text-blue-500"/>
                        Riepilogo Analisi AI
                    </h2>
                     <button
                        onClick={handleExportPdf}
                        disabled={isGeneratingPdf}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-wait transition-colors"
                    >
                        {isGeneratingPdf ? (
                            <>
                                <Spinner />
                                <span className="ml-2">Creazione...</span>
                            </>
                        ) : (
                            <>
                               <PdfIcon className="w-5 h-5 mr-2"/>
                               <span>Esporta PDF</span>
                            </>
                        )}
                    </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{analysis.summary}</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200">
                    <div>
                        <p className="text-sm text-gray-500">Stipendio Netto Corrente</p>
                        <p className="text-lg font-bold text-green-600">€ {currentPayslip.netSalary.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Media Netto Precedente</p>
                        <p className="text-lg font-bold text-gray-700">€ {analysis.averageNetSalary.toFixed(2)}</p>
                    </div>
                 </div>
            </div>

            {/* Differences Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                 <h2 className="text-xl font-bold text-gray-800 p-6 flex items-center border-b border-gray-200">
                    <TrendingUpIcon className="mr-2 text-indigo-500"/>
                    Dettaglio delle Variazioni Significative
                </h2>
                {analysis.differingItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-left text-gray-600">
                                <tr>
                                    <th className="py-3 px-4 font-semibold">Voce e Commento AI</th>
                                    <th className="py-3 px-4 text-center font-semibold">Valore Corrente</th>
                                    <th className="py-3 px-4 text-center font-semibold">Media Precedente</th>
                                    <th className="py-3 px-4 text-center font-semibold">Differenza</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analysis.differingItems.map((item, index) => (
                                    <DifferenceRow key={index} item={item} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="p-6 text-center text-gray-500">Nessuna variazione significativa trovata rispetto ai mesi precedenti. Lo stipendio è in linea con lo storico.</p>
                )}
            </div>
        </div>
    );
};

export default HistoricalAnalysis;