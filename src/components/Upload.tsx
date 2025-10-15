import React, { useState, useCallback } from 'react';
import { analyzePayslip } from '../services/geminiService.ts';
import { Payslip } from '../types.ts';
import Spinner from './common/Spinner.tsx';
import { UploadIcon } from './common/Icons.tsx';

interface UploadProps {
    onAnalysisComplete: (payslip: Payslip) => void;
}

const Upload: React.FC<UploadProps> = ({ onAnalysisComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (['image/jpeg', 'image/png', 'application/pdf'].includes(droppedFile.type)) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError('Formato file non supportato. Usa PDF, JPG, o PNG.');
            }
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);


    const handleSubmit = async () => {
        if (!file) {
            setError('Per favore, seleziona un file da caricare.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const payslipData = await analyzePayslip(file);
            onAnalysisComplete(payslipData);
        } catch (err) {
            setError('Analisi fallita. Assicurati che il documento sia una busta paga leggibile e riprova.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Carica Busta Paga</h1>
            <div className="bg-white p-8 rounded-xl shadow-md">
                {isLoading ? (
                    <div className="text-center">
                        <Spinner />
                        <p className="mt-4 text-lg font-semibold text-blue-600">Analisi in corso...</p>
                        <p className="text-gray-500">L'IA sta leggendo la tua busta paga. Potrebbe volerci un momento.</p>
                    </div>
                ) : (
                    <>
                        <label
                            htmlFor="file-upload"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
                        >
                            <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
                            <div>
                                <span className="text-blue-600 font-semibold">Scegli un file</span>
                                <span className="text-gray-500 ml-1">o trascinalo qui</span>
                            </div>
                            <input id="file-upload" name="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                            <p className="text-xs text-gray-400 mt-2">PDF, PNG, JPG (MAX. 10MB)</p>
                        </label>

                        {file && (
                            <div className="mt-6 text-center font-medium text-gray-700">
                                File selezionato: {file.name}
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="mt-8 text-center">
                            <button
                                onClick={handleSubmit}
                                disabled={!file || isLoading}
                                className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                            >
                                Analizza Documento
                            </button>
                        </div>
                    </>
                )}
                 <div className="mt-8 text-center text-sm text-gray-500">
                    <p>I tuoi documenti sono trattati con la massima riservatezza e non vengono memorizzati permanentemente sui nostri server dopo l'analisi.</p>
                </div>
            </div>
        </div>
    );
};

export default Upload;