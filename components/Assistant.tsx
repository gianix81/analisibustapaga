import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService.ts';
import { ChatMessage, Payslip } from '../types.ts';
import { SendIcon, PaperclipIcon } from './common/Icons.tsx';
import Spinner from './common/Spinner.tsx';

interface AssistantProps {
    payslips: Payslip[];
    mode: 'general' | 'contextual';
    focusedPayslip?: Payslip | null;
    payslipsToCompare?: [Payslip, Payslip] | null;
}

const Assistant: React.FC<AssistantProps> = ({ payslips, mode, focusedPayslip, payslipsToCompare }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [includeTaxTables, setIncludeTaxTables] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    // Clear chat when focused payslip or comparison context changes
    useEffect(() => {
        if (mode === 'contextual') {
            setMessages([]);
        }
    }, [focusedPayslip, payslipsToCompare, mode]);


    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = { id: `msg-${Date.now()}`, text: input, sender: 'user' };
        const history = [...messages];
        
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        const currentAttachment = attachment;
        setInput('');
        setAttachment(null);
        setIsLoading(true);

        const context = mode === 'general' 
            ? { payslips, file: currentAttachment, includeTaxTables }
            : { focusedPayslip: focusedPayslip, payslipsToCompare: payslipsToCompare };

        try {
            const stream = await getChatResponse(history, currentInput, context);
            
            const aiMessageId = `msg-${Date.now() + 1}`;
            setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai' }]);

            let fullText = '';
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    fullText += chunkText;
                    setMessages(prev => prev.map(msg => 
                        msg.id === aiMessageId ? { ...msg, text: fullText } : msg
                    ));
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                text: 'Spiacente, non sono riuscito a elaborare la tua richiesta. Riprova.',
                sender: 'ai',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAttachment(e.target.files[0]);
        }
    };

    const triggerFileIput = () => {
        fileInputRef.current?.click();
    };

    const containerHeight = mode === 'general' ? 'h-[85vh]' : 'h-[70vh]';

    const getHeader = () => {
        if (mode === 'contextual') {
            return payslipsToCompare ? "Assistente al Confronto" : "Assistente Contestuale";
        }
        return "Assistente AI";
    }

    const getSubheader = () => {
        if (mode === 'contextual') {
            return payslipsToCompare ? "Chiedimi qualcosa su queste due buste paga." : "Chiedimi qualcosa su questa specifica busta paga.";
        }
        return "Chiedimi qualcosa sul tuo archivio o allega un documento.";
    }

    const getIntroText = () => {
         if (mode === 'contextual') {
            return payslipsToCompare ? "Fai una domanda per approfondire il confronto tra questi due documenti." : "Fai una domanda per iniziare l'analisi di questo documento.";
        }
        return "Puoi fare una domanda generale o allegare un file per un'analisi più specifica.";
    }
    
    const getPlaceholder = () => {
        return payslipsToCompare ? "Chiedimi qualcosa sul confronto..." : "Scrivi la tua domanda...";
    }

    return (
        <div className={`flex flex-col ${containerHeight} bg-white rounded-xl shadow-md`}>
            <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-800">
                   {getHeader()}
                </h1>
                <p className="text-sm text-gray-500">
                    {getSubheader()}
                </p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                     <div className="text-center text-gray-500 pt-10">
                        {getIntroText()}
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>}
                        <div className={`max-w-md lg:max-w-lg p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                            <p style={{ whiteSpace: "pre-wrap" }}>{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && messages[messages.length - 1]?.sender === 'ai' && messages[messages.length - 1]?.text === '' && (
                    <div className="flex items-end gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
                         <div className="max-w-md lg:max-w-lg p-4 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                           <Spinner/>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200">
                {attachment && mode === 'general' && (
                    <div className="mb-2 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full inline-block">
                        <span>{attachment.name}</span>
                        <button onClick={() => setAttachment(null)} className="ml-2 font-bold">×</button>
                    </div>
                )}
                {mode === 'general' && (
                    <div className="flex items-center mb-3 px-1">
                        <input
                            type="checkbox"
                            id="include-tax-tables"
                            name="include-tax-tables"
                            checked={includeTaxTables}
                            onChange={(e) => setIncludeTaxTables(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="include-tax-tables" className="ml-2 text-sm text-gray-600 cursor-pointer">
                            Includi tabelle addizionali comunali (documento interno)
                        </label>
                    </div>
                )}
                <div className="relative flex items-center">
                    {mode === 'general' && (
                        <>
                            <button
                                onClick={triggerFileIput}
                                className="p-2 text-gray-500 hover:text-blue-600"
                                aria-label="Allega file"
                            >
                                <PaperclipIcon />
                            </button>
                            <input type="file" id="file-attachment" name="file-attachment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        </>
                    )}
                    <label htmlFor="chat-input" className="sr-only">{getPlaceholder()}</label>
                    <input
                        type="text"
                        id="chat-input"
                        name="chat-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={getPlaceholder()}
                        className="w-full py-3 pl-4 pr-12 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || input.trim() === ''}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                        aria-label="Invia messaggio"
                    >
                       <SendIcon/>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Assistant;