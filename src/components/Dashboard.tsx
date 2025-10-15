
import React, { useState, useEffect, useRef } from 'react';
import { Payslip, PayItem } from '../types.ts';
import Card from './common/Card.tsx';
import { WalletIcon, TaxIcon, EuroIcon, InfoIcon, TfrIcon, BeachIcon, ChartBarIcon, PdfIcon, TrendingUpIcon, LayersIcon } from './common/Icons.tsx';
import SalaryChart from './SalaryChart.tsx';
import Assistant from './Assistant.tsx';
import EvolutionChart from './EvolutionChart.tsx';
import { getPayslipSummary } from '../services/geminiService.ts';
import PdfReport from './PdfReport.tsx';
import Spinner from './common/Spinner.tsx';
import HistoricalAnalysis from './HistoricalAnalysis.tsx';

// TypeScript declarations for CDN libraries
declare const jspdf: any;
declare const html2canvas: any;

interface DashboardProps {
    payslip: Payslip | null;
    alert: string | null;
    payslips: Payslip[];
}

const DetailRow: React.FC<{ label: string, value: string | number | undefined, currency?: boolean }> = ({ label, value, currency = false }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-800">
            {currency ? `€ ${Number(value || 0).toFixed(2)}` : value || 'N/A'}
        </span>
    </div>
);

const PayItemTable: React.FC<{ title: string, items: PayItem[], colorClass: string }> = ({ title, items, colorClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className={`text-lg font-bold mb-4 ${colorClass}`}>{title}</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold text-gray-600">Descrizione</th>
                        <th className="text-right py-2 font-semibold text-gray-600">Valore</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 last:border-b-0">
                            <td className="py-2 text-gray-700">{item.description}</td>
                            <td className={`text-right py-2 font-mono text-gray-900`}>€ {item.value.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ payslip, alert, payslips }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'historical'>('overview');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [pdfSummary, setPdfSummary] = useState<string | null>(null);
    const pdfReportRef = useRef<HTMLDivElement>(null);

    const getMonthName = (month: number) => new Date(2000, month - 1, 1).toLocaleString('it-IT', { month: 'long' });
    
    useEffect(() => {
        if (pdfSummary && isGeneratingPdf && pdfReportRef.current && payslip) {
            if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') {
                console.error("jsPDF or html2canvas is not loaded");
                setIsGeneratingPdf(false);
                setPdfSummary(null);
                return;
            }

            const { jsPDF } = jspdf;
            
            html2canvas(pdfReportRef.current, { scale: 2 })
                .then((canvas) => {
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({
                        orientation: 'p',
                        unit: 'mm',
                        format: 'a4'
                    });

                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    
                    // Maintain aspect ratio
                    const imgRatio = canvasWidth / canvasHeight;
                    const pdfRatio = pdfWidth / pdfHeight;

                    let imgWidth = pdfWidth;
                    let imgHeight = pdfWidth / imgRatio;

                    // If the image is taller than the page, scale down to fit height
                    if (imgHeight > pdfHeight) {
                        imgHeight = pdfHeight;
                        imgWidth = imgHeight * imgRatio;
                    }

                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                    pdf.save(`Report-${getMonthName(payslip.period.month)}-${payslip.period.year}.pdf`);
                })
                .catch(err => {
                    console.error("Error generating PDF", err);
                })
                .finally(() => {
                    setIsGeneratingPdf(false);
                    setPdfSummary(null);
                });
        }
    }, [pdfSummary, isGeneratingPdf, payslip]);

    const handleExportPdf = async () => {
        if (!payslip || isGeneratingPdf) return;

        setIsGeneratingPdf(true);
        setPdfSummary(null);

        try {
            const summary = await getPayslipSummary(payslip);
            setPdfSummary(summary);
        } catch (error) {
            console.error("Failed to get summary for PDF", error);
            setIsGeneratingPdf(false);
        }
    };

    const hasArchive = payslips.length > 0;
    const hasEnoughForHistory = payslips.length > 1;

    useEffect(() => {
        if (!hasEnoughForHistory) {
            setActiveTab('overview');
        }
    }, [hasEnoughForHistory]);

    if (!payslip) {
        return (
            <div className="text-center p-8 bg-white rounded-xl shadow-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Benvenuto in PayAnalyst</h1>
                {hasArchive ? (
                     <p className="text-gray-600">Seleziona una busta paga dall'archivio per visualizzarne i dettagli.</p>
                ) : (
                    <p className="text-gray-600">Carica la tua prima busta paga per iniziare l'analisi.</p>
                )}
            </div>
        );
    }

    return (
        <div>
            {isGeneratingPdf && pdfSummary && (
                <div ref={pdfReportRef} style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -10 }}>
                    <PdfReport payslip={payslip} summary={pdfSummary} />
                </div>
            )}
            {alert && (
                 <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md shadow-sm flex items-start" role="alert">
                    <InfoIcon className="w-6 h-6 mr-3 text-yellow-500 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Attenzione</p>
                        <p>{alert}</p>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 capitalize">
                    Dashboard {getMonthName(payslip.period.month)} {payslip.period.year}
                </h1>
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
            
            {/* Tab Navigation */}
            <div className="mb-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors
                            ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        <ChartBarIcon className="w-5 h-5 mr-2"/>
                        Riepilogo
                    </button>
                    {hasEnoughForHistory && (
                        <button
                            onClick={() => setActiveTab('historical')}
                             className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center transition-colors
                            ${activeTab === 'historical' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <TrendingUpIcon className="w-5 h-5 mr-2" />
                            Analisi Storico
                        </button>
                    )}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div>
                    {/* Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <Card title="Stipendio Lordo" value={payslip.grossSalary} icon={<EuroIcon />} color="blue" />
                        <Card title="Trattenute Totali" value={payslip.totalDeductions} icon={<TaxIcon />} color="red" />
                        <Card title="Stipendio Netto" value={payslip.netSalary} icon={<WalletIcon />} color="green" />
                    </div>
                    
                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <ChartBarIcon className="w-5 h-5 mr-2 text-indigo-500"/>
                                Ripartizione Lordo
                            </h2>
                            <SalaryChart payslip={payslip} />
                        </div>
                        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <ChartBarIcon className="w-5 h-5 mr-2 text-indigo-500"/>
                                Andamento Stipendio
                            </h2>
                            {payslips.length > 1 ? (
                                <EvolutionChart payslips={payslips} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                <p>Carica altre buste paga per vedere l'andamento nel tempo.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pay Items Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <PayItemTable title="Competenze" items={payslip.incomeItems} colorClass="text-green-600" />
                        <PayItemTable title="Trattenute" items={payslip.deductionItems} colorClass="text-red-600" />
                    </div>
                    
                    {/* Detailed Data Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8">
                        {/* Remuneration Elements */}
                        {payslip.remunerationElements && payslip.remunerationElements.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><LayersIcon className="w-5 h-5 mr-2 text-purple-500"/>Composizione Retribuzione</h2>
                                <div className="space-y-1">
                                    {payslip.remunerationElements.map((item, index) => (
                                        <DetailRow key={index} label={item.description} value={item.value} currency />
                                    ))}
                                    <div className="flex justify-between items-center py-2 border-t-2 border-gray-200 mt-2">
                                        <span className="text-sm font-bold text-gray-700">Retribuzione Mensile Lorda</span>
                                        <span className="text-sm font-bold text-gray-900">
                                            € {payslip.remunerationElements.reduce((acc, item) => acc + item.value, 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Tax Data */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><TaxIcon className="w-5 h-5 mr-2 text-red-500"/>Dati Fiscali</h2>
                            <div className="space-y-1">
                                <DetailRow label="Imponibile Fiscale" value={payslip.taxData.taxableBase} currency />
                                <DetailRow label="Imposta Lorda" value={payslip.taxData.grossTax} currency />
                                <DetailRow label="Detrazioni Lavoro Dip." value={payslip.taxData.deductions.employee} currency />
                                <DetailRow label="Detrazioni Totali" value={payslip.taxData.deductions.total} currency />
                                <DetailRow label="Imposta Netta" value={payslip.taxData.netTax} currency />
                                <DetailRow label="Addizionale Regionale" value={payslip.taxData.regionalSurtax} currency />
                                <DetailRow label="Addizionale Comunale" value={payslip.taxData.municipalSurtax} currency />
                            </div>
                        </div>

                        {/* TFR Data */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><TfrIcon className="w-5 h-5 mr-2 text-blue-500"/>Situazione TFR</h2>
                            <div className="space-y-1">
                                <DetailRow label="Imponibile TFR" value={payslip.tfr.taxableBase} currency />
                                <DetailRow label="Quota Maturata" value={payslip.tfr.accrued} currency />
                                <DetailRow label="Fondo Precedente" value={payslip.tfr.previousBalance} currency />
                                <DetailRow label="Fondo Totale" value={payslip.tfr.totalFund} currency />
                            </div>
                        </div>

                        {/* Leave Data */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><BeachIcon className="w-5 h-5 mr-2 text-orange-500"/>Ferie & Permessi</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-gray-700">Ferie</h3>
                                    <DetailRow label="Saldo Precedente" value={payslip.leaveData.vacation.previous} />
                                    <DetailRow label="Maturate" value={payslip.leaveData.vacation.accrued} />
                                    <DetailRow label="Godute" value={payslip.leaveData.vacation.taken} />
                                    <DetailRow label="Saldo Residuo" value={payslip.leaveData.vacation.balance} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-700">Permessi (ROL)</h3>
                                    <DetailRow label="Saldo Precedente" value={payslip.leaveData.permits.previous} />
                                    <DetailRow label="Maturati" value={payslip.leaveData.permits.accrued} />
                                    <DetailRow label="Goduti" value={payslip.leaveData.permits.taken} />
                                    <DetailRow label="Saldo Residuo" value={payslip.leaveData.permits.balance} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contextual Assistant Section */}
                    <div className="mt-8">
                        <Assistant mode="contextual" focusedPayslip={payslip} payslips={[]} />
                    </div>
                </div>
            )}
            
            {activeTab === 'historical' && hasEnoughForHistory && (
                <HistoricalAnalysis currentPayslip={payslip} allPayslips={payslips} />
            )}

        </div>
    );
};

export default Dashboard;