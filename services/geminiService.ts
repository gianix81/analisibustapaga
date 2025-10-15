import { GoogleGenAI } from "@google/genai";
import { ChatMessage, Payslip } from "../types.ts";

// ✅ Recupera la chiave API da .env o da Netlify
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Chiave API Gemini mancante. Imposta VITE_GEMINI_API_KEY nel file .env o su Netlify."
  );
}

// ✅ Istanzia il client corretto per @google/genai@1.24.0
const genAI = new GoogleGenAI({ apiKey });

/* -------------------------------------------------------------------------- */
/* TABELLE ADDIZIONALI COMUNALI                                   */
/* -------------------------------------------------------------------------- */
const MUNICIPAL_TAX_TABLES_TEXT = `Diffusione Limitata
(omesso per brevità)
`;

/* -------------------------------------------------------------------------- */
/* FUNZIONI DI SUPPORTO TECNICO                                   */
/* -------------------------------------------------------------------------- */
const fileToGenerativePart = async (file: File) => {
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(typeof reader.result === "string" ? reader.result.split(",")[1] : "");
    reader.readAsDataURL(file);
  });
  return { inlineData: { mimeType: file.type, data: base64 } };
};

/* -------------------------------------------------------------------------- */
/* FUNZIONI PRINCIPALI AI                                       */
/* -------------------------------------------------------------------------- */
export const analyzePayslip = async (file: File): Promise<Payslip> => {
  const imagePart = await fileToGenerativePart(file);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Analizza semanticamente questa busta paga italiana.
Fornisci un risultato in formato JSON con le principali voci e valori.
`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
  });

  const text = result.response.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Errore nel parsing JSON:", text);
    throw new Error("La risposta non è in formato JSON valido.");
  }
};

/* -------------------------------------------------------------------------- */
/* ANALISI DI CONFRONTO                                         */
/* -------------------------------------------------------------------------- */
export const getComparisonAnalysis = async (p1: Payslip, p2: Payslip) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `
Confronta le seguenti due buste paga e spiega le differenze principali.
Busta paga 1: ${JSON.stringify(p1, null, 2)}
Busta paga 2: ${JSON.stringify(p2, null, 2)}
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

/* -------------------------------------------------------------------------- */
/* SINTESI DESCRITTIVA                                          */
/* -------------------------------------------------------------------------- */
export const getPayslipSummary = async (p: Payslip): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Descrivi in modo semplice e professionale la seguente busta paga:
${JSON.stringify(p, null, 2)}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/* -------------------------------------------------------------------------- */
/* CHAT CONTEXTUALE                                             */
/* -------------------------------------------------------------------------- */
export const getChatResponse = async (
  history: ChatMessage[],
  question: string
) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const chat = model.startChat({
    history: history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
  });

  const result = await chat.sendMessage(question);
  return result.response.text();
};