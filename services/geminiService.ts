import { GoogleAIClient, Type } from "@google/genai";
import { ChatMessage, Payslip } from "../types.ts";

// ✅ Recupera la chiave API in modo compatibile con Vite
// Definisci in .env locale o su Netlify:
// VITE_GEMINI_API_KEY=la_tua_chiave_api
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Chiave API Gemini mancante. Imposta VITE_GEMINI_API_KEY nel file .env o su Netlify.");
}

// ✅ Usa la nuova classe corretta
const ai = new GoogleAIClient({ apiKey });

/* -------------------------------------------------------------------------- */
/*                        TABELLE ADDIZIONALI COMUNALI                        */
/* -------------------------------------------------------------------------- */
const MUNICIPAL_TAX_TABLES_TEXT = `Diffusione Limitata
(omesso per brevità, identico al tuo testo precedente)
`;

/* -------------------------------------------------------------------------- */
/*                        FUNZIONI DI SUPPORTO TECNICO                        */
/* -------------------------------------------------------------------------- */

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]);
      } else {
        resolve("");
      }
    };
    reader.readAsDataURL(file);
  });
  const data = await base64EncodedDataPromise;
  return {
    inlineData: {
      mimeType: file.type,
      data,
    },
  };
};

/* -------------------------------------------------------------------------- */
/*                               SCHEMI DATI                                  */
/* -------------------------------------------------------------------------- */

const payItemSchema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING },
    quantity: { type: Type.NUMBER },
    rate: { type: Type.NUMBER },
    value: { type: Type.NUMBER },
  },
  required: ["description", "value"],
};

const leaveBalanceSchema = {
  type: Type.OBJECT,
  properties: {
    previous: { type: Type.NUMBER },
    accrued: { type: Type.NUMBER },
    taken: { type: Type.NUMBER },
    balance: { type: Type.NUMBER },
  },
  required: ["previous", "accrued", "taken", "balance"],
};

const payslipSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    period: {
      type: Type.OBJECT,
      properties: {
        month: { type: Type.INTEGER },
        year: { type: Type.INTEGER },
      },
      required: ["month", "year"],
    },
    company: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        taxId: { type: Type.STRING },
        address: { type: Type.STRING },
      },
      required: ["name", "taxId"],
    },
    employee: {
      type: Type.OBJECT,
      properties: {
        firstName: { type: Type.STRING },
        lastName: { type: Type.STRING },
        taxId: { type: Type.STRING },
        level: { type: Type.STRING },
        contractType: { type: Type.STRING },
      },
      required: ["firstName", "lastName", "taxId"],
    },
    incomeItems: { type: Type.ARRAY, items: payItemSchema },
    deductionItems: { type: Type.ARRAY, items: payItemSchema },
    grossSalary: { type: Type.NUMBER },
    totalDeductions: { type: Type.NUMBER },
    netSalary: { type: Type.NUMBER },
    taxData: { type: Type.OBJECT },
    socialSecurityData: { type: Type.OBJECT },
    tfr: { type: Type.OBJECT },
    leaveData: { type: Type.OBJECT },
  },
  required: [
    "id",
    "period",
    "company",
    "employee",
    "incomeItems",
    "deductionItems",
    "grossSalary",
    "totalDeductions",
    "netSalary",
    "taxData",
    "socialSecurityData",
    "tfr",
    "leaveData",
  ],
};

/* -------------------------------------------------------------------------- */
/*                          FUNZIONI PRINCIPALI AI                            */
/* -------------------------------------------------------------------------- */

export const analyzePayslip = async (file: File): Promise<Payslip> => {
  const imagePart = await fileToGenerativePart(file);
  const prompt = `
Esegui un'analisi semantica completa e dettagliata di questa busta paga italiana.
Popola lo schema JSON fornito con la massima granularità possibile.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ text: prompt }, imagePart],
    config: {
      responseMimeType: "application/json",
      responseSchema: payslipSchema,
    },
  });

  const jsonStr = response.text.trim();
  try {
    const payslipData = JSON.parse(jsonStr);
    if (!payslipData.id) {
      payslipData.id = `payslip-${Date.now()}-${Math.random()}`;
    }
    return payslipData as Payslip;
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", jsonStr, e);
    throw new Error(
      "L'analisi ha prodotto un risultato non valido. Assicurati che il file sia una busta paga chiara."
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                         ANALISI DI CONFRONTO                               */
/* -------------------------------------------------------------------------- */

export const getComparisonAnalysis = async (
  p1: Payslip,
  p2: Payslip
): Promise<string> => {
  const getMonthName = (m: number) =>
    new Date(2000, m - 1, 1).toLocaleString("it-IT", { month: "long" });

  const prompt = `
Confronta le seguenti due buste paga e spiega le differenze principali.
Busta Paga 1 (${getMonthName(p1.period.month)} ${p1.period.year}):
${JSON.stringify(p1, null, 2)}

Busta Paga 2 (${getMonthName(p2.period.month)} ${p2.period.year}):
${JSON.stringify(p2, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ text: prompt }],
  });

  return response.text;
};

/* -------------------------------------------------------------------------- */
/*                         SINTESI DESCRITTIVA                                */
/* -------------------------------------------------------------------------- */

export const getPayslipSummary = async (p: Payslip): Promise<string> => {
  const prompt = `
Descrivi in modo semplice e professionale la seguente busta paga:
${JSON.stringify(p, null, 2)}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ text: prompt }],
  });

  return response.text;
};

/* -------------------------------------------------------------------------- */
/*                        CHAT CONTEXTUALE                                    */
/* -------------------------------------------------------------------------- */

export const getChatResponse = async (
  history: ChatMessage[],
  question: string,
  context: {
    payslips?: Payslip[];
    file?: File;
    focusedPayslip?: Payslip | null;
    payslipsToCompare?: [Payslip, Payslip] | null;
    includeTaxTables?: boolean;
  }
) => {
  let systemInstruction = `Sei un consulente del lavoro virtuale esperto di CCNL italiani. 
Rispondi in modo informativo, preciso e non vincolante.`;

  if (context.includeTaxTables) {
    systemInstruction += `
--- INIZIO DOCUMENTO ADDIZIONALI COMUNALI ---
${MUNICIPAL_TAX_TABLES_TEXT}
--- FINE DOCUMENTO ADDIZIONALI COMUNALI ---
`;
  }

  const conversationHistory = history.map((msg) => ({
    role: msg.sender === "user" ? "user" : "model",
    parts: [{ text: msg.text }],
  }));

  const userParts: any[] = [{ text: question }];
  if (context.file) {
    const filePart = await fileToGenerativePart(context.file);
    userParts.unshift(filePart);
  }

  const contents = [...conversationHistory, { role: "user", parts: userParts }];

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents,
    config: { systemInstruction },
  });

  return responseStream;
};
