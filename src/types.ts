export enum View {
    Dashboard = 'dashboard',
    Upload = 'upload',
    Archive = 'archive',
    Compare = 'compare',
    Assistant = 'assistant',
    Settings = 'settings',
    ShiftPlanner = 'shift_planner',
    LeavePlanner = 'leave_planner',
}

export interface User {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    placeOfBirth: string;
}

export interface PayItem {
    description: string;
    quantity?: number;
    rate?: number;
    value: number;
}

export interface LeaveBalance {
    previous: number;
    accrued: number;
    taken: number;
    balance: number;
}

export interface Payslip {
    id: string;
    period: {
        month: number;
        year: number;
    };
    company: {
        name: string;
        taxId: string;
        address?: string;
    };
    employee: {
        firstName: string;
        lastName: string;
        taxId: string;
        level?: string;
        contractType?: string;
    };
    
    remunerationElements: PayItem[];
    incomeItems: PayItem[];
    deductionItems: PayItem[];
    
    grossSalary: number; // Retribuzione Lorda (Totale Competenze)
    totalDeductions: number; // Totale Trattenute
    netSalary: number; // Netto in Busta
    
    taxData: {
        taxableBase: number; // Imponibile Fiscale
        grossTax: number; // Imposta Lorda
        deductions: {
            employee: number; // Detrazione Lavoro Dipendente
            family?: number; // Detrazioni Familiari a Carico
            total: number; // Totale Detrazioni
        },
        netTax: number; // Imposta Netta
        regionalSurtax: number; // Addizionale Regionale
        municipalSurtax: number; // Addizionale Comunale
    };
    
    socialSecurityData: {
        taxableBase: number; // Imponibile Previdenziale (INPS)
        employeeContribution: number; // Contributi a carico dipendente
        companyContribution: number; // Contributi a carico azienda
        inailContribution?: number; // Contributo INAIL (se presente)
    };

    tfr: { // Trattamento di Fine Rapporto
        taxableBase: number; // Imponibile TFR
        accrued: number; // Quota maturata nel mese
        previousBalance: number; // Fondo al 31/12 anno precedente
        totalFund: number; // Fondo TFR totale
    };

    leaveData: {
        vacation: LeaveBalance; // Ferie
        permits: LeaveBalance; // Permessi (ROL)
    };
}


export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

export interface HistoricalAnalysisResult {
    summary: string;
    averageNetSalary: number;
    averageGrossSalary: number;
    differingItems: {
        description: string;
        currentValue: number;
        averageValue: number;
        difference: number;
        type: 'income' | 'deduction' | 'other';
        comment: string;
    }[];
}

export interface TimeInterval {
    id: string;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
}

export interface Shift {
    id: string;
    date: string; // YYYY-MM-DD
    intervals: TimeInterval[];
    notes?: string;
}

export type AbsenceReason = 'Ferie' | 'ROL' | 'Permesso Speciale' | 'Malattia' | 'Legge 104' | 'Riposo' | 'Altro';

export const ABSENCE_REASONS: AbsenceReason[] = ['Ferie', 'ROL', 'Permesso Speciale', 'Malattia', 'Legge 104', 'Riposo', 'Altro'];

export interface Absence {
    id: string;
    date: string; // YYYY-MM-DD
    reason: AbsenceReason;
    notes?: string;
}


export interface LeavePlan {
    id: string;
    type: 'Ferie' | 'ROL';
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    notes?: string;
}