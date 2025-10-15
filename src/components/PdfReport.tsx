import React from 'react';
import { Payslip } from '../types.ts';
import SalaryChart from './SalaryChart.tsx';
import { EuroIcon, LogoIcon, TaxIcon, WalletIcon } from './common/Icons.tsx';

interface PdfReportProps {
    payslip: Payslip;
    summary: string;
}

const DetailRow: React.FC<{ label: string; value: string | number; isCurrency?: boolean }> = ({ label, value, isCurrency = true }) => (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{isCurrency ? `€ ${Number(value).toFixed(2)}` : value}</span>
    </div>
);

const PdfReport: React.FC<PdfReportProps> = ({ payslip, summary }) => {
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
                        <h1 className="text-2xl font-bold capitalize">{`${getMonthName(payslip.period.month)} ${payslip.period.year}`}</h1>
                        <p className="text-lg text-gray-600">{`${payslip.employee.firstName} ${payslip.employee.lastName}`}</p>
                    </div>
                </header>

                {/* Main Content */}
                <main className="py-8">
                    {/* Key Metrics */}
                    <section className="grid grid-cols-3 gap-6 mb-8">
                        <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-3">
                             <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><EuroIcon className="w-6 h-6"/></div>
                             <div>
                                <p className="text-sm text-blue-800">Stipendio Lordo</p>
                                <p className="text-xl font-bold text-blue-900">€ {payslip.grossSalary.toFixed(2)}</p>
                             </div>
                        </div>
                         <div className="bg-red-50 p-4 rounded-lg flex items-center space-x-3">
                             <div className="bg-red-100 text-red-600 p-2 rounded-full"><TaxIcon className="w-6 h-6"/></div>
                             <div>
                                <p className="text-sm text-red-800">Trattenute Totali</p>
                                <p className="text-xl font-bold text-red-900">€ {payslip.totalDeductions.toFixed(2)}</p>
                             </div>
                        </div>
                         <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-3">
                             <div className="bg-green-100 text-green-600 p-2 rounded-full"><WalletIcon className="w-6 h-6"/></div>
                             <div>
                                <p className="text-sm text-green-800">Stipendio Netto</p>
                                <p className="text-xl font-bold text-green-900">€ {payslip.netSalary.toFixed(2)}</p>
                             </div>
                        </div>
                    </section>

                    {/* AI Analysis */}
                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-2 mb-3">Analisi Descrittiva AI</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{summary}</p>
                        </div>
                    </section>
                    
                    {/* Charts & Data Tables */}
                    <section className="grid grid-cols-2 gap-8">
                        {/* Left Column: Chart */}
                        <div>
                             <h3 className="text-lg font-semibold text-gray-800 mb-2">Ripartizione Stipendio Lordo</h3>
                             <div className="border rounded-lg p-4">
                                <SalaryChart payslip={payslip} />
                             </div>
                        </div>
                        {/* Right Column: Key Data */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Dati Salienti</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-1">Dati Fiscali</h4>
                                    <div className="p-3 border rounded-lg bg-gray-50/50">
                                        <DetailRow label="Imponibile Fiscale" value={payslip.taxData.taxableBase} />
                                        <DetailRow label="Imposta Netta" value={payslip.taxData.netTax} />
                                        <DetailRow label="Detrazioni Totali" value={payslip.taxData.deductions.total} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-1">Dati Previdenziali</h4>
                                    <div className="p-3 border rounded-lg bg-gray-50/50">
                                        <DetailRow label="Imponibile INPS" value={payslip.socialSecurityData.taxableBase} />
                                        <DetailRow label="Contributi Dipendente" value={payslip.socialSecurityData.employeeContribution} />
                                    </div>
                                </div>
                            </div>
                        </div>
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

export default PdfReport;