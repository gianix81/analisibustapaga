import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import Upload from './components/Upload.tsx';
import Archive from './components/Archive.tsx';
import Compare from './components/Compare.tsx';
import Assistant from './components/Assistant.tsx';
import Onboarding from './components/Onboarding.tsx';
import Settings from './components/Settings.tsx';
import ShiftPlanner from './components/ShiftPlanner.tsx';
import LeavePlanner from './components/LeavePlanner.tsx';
import { View, Payslip, User, Shift, LeavePlan } from './types.ts';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.Dashboard);
    
    const [user, setUser] = useState<User | null>(() => {
        try {
            const item = window.localStorage.getItem('payslip_user');
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error("Error reading user from localStorage", error);
            return null;
        }
    });

    const [payslips, setPayslips] = useState<Payslip[]>(() => {
         try {
            const item = window.localStorage.getItem('payslip_data');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error("Error reading payslips from localStorage", error);
            return [];
        }
    });
    
    const [shifts, setShifts] = useState<Shift[]>(() => {
        try {
            const item = window.localStorage.getItem('payslip_shifts');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error("Error reading shifts from localStorage", error);
            return [];
        }
    });

    const [leavePlans, setLeavePlans] = useState<LeavePlan[]>(() => {
        try {
            const item = window.localStorage.getItem('payslip_leave_plans');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error("Error reading leave plans from localStorage", error);
            return [];
        }
    });


    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(payslips.length > 0 ? payslips[0] : null);
    const [payslipsToCompare, setPayslipsToCompare] = useState<[Payslip, Payslip] | null>(null);
    const [alert, setAlert] = useState<string | null>(null);

    useEffect(() => {
        try {
            if (user) {
                window.localStorage.setItem('payslip_user', JSON.stringify(user));
            } else {
                 window.localStorage.removeItem('payslip_user');
            }
        } catch (error) {
            console.error("Error saving user to localStorage", error);
        }
    }, [user]);

    useEffect(() => {
        try {
            window.localStorage.setItem('payslip_data', JSON.stringify(payslips));
        } catch (error) {
            console.error("Error saving payslips to localStorage", error);
        }
    }, [payslips]);
    
    useEffect(() => {
        try {
            window.localStorage.setItem('payslip_shifts', JSON.stringify(shifts));
        } catch (error) {
            console.error("Error saving shifts to localStorage", error);
        }
    }, [shifts]);

    useEffect(() => {
        try {
            window.localStorage.setItem('payslip_leave_plans', JSON.stringify(leavePlans));
        } catch (error) {
            console.error("Error saving leave plans to localStorage", error);
        }
    }, [leavePlans]);

    const handleAnalysisComplete = (newPayslip: Payslip) => {
        const namesMatch = user &&
            newPayslip.employee.firstName.trim().toLowerCase() === user.firstName.trim().toLowerCase() &&
            newPayslip.employee.lastName.trim().toLowerCase() === user.lastName.trim().toLowerCase();

        setSelectedPayslip(newPayslip);

        if (namesMatch) {
            const updatedPayslips = [...payslips, newPayslip].sort((a, b) => {
                const dateA = new Date(a.period.year, a.period.month - 1);
                const dateB = new Date(b.period.year, b.period.month - 1);
                return dateB.getTime() - dateA.getTime();
            });
            setPayslips(updatedPayslips);
            setAlert(null);
        } else {
            setAlert("Attenzione: I dati anagrafici sulla busta paga non corrispondono al tuo profilo. Questa analisi è temporanea e non verrà salvata nell'archivio.");
        }
        
        setCurrentView(View.Dashboard);
    };
    
    const handleSelectPayslipForDashboard = (payslip: Payslip) => {
        setSelectedPayslip(payslip);
        setAlert(null); // Clear alert when viewing a saved payslip
        setCurrentView(View.Dashboard);
    };

    const handleCompare = (payslipsForComparison: [Payslip, Payslip]) => {
        setPayslipsToCompare(payslipsForComparison);
        setCurrentView(View.Compare);
    }
    
    const handleDeletePayslip = (payslipId: string) => {
        const updatedPayslips = payslips.filter(p => p.id !== payslipId);
        setPayslips(updatedPayslips);
        if(selectedPayslip?.id === payslipId){
           setSelectedPayslip(updatedPayslips.length > 0 ? updatedPayslips[0] : null);
        }
        if (currentView === View.Dashboard && updatedPayslips.length === 0) {
            setSelectedPayslip(null);
        }
    }
    
    const handleUpdateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    const handleSaveShift = (shift: Shift) => {
        setShifts(prev => {
            const index = prev.findIndex(s => s.id === shift.id);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = shift;
                return updated;
            }
            return [...prev, shift];
        });
    };

    const handleDeleteShift = (shiftId: string) => {
        setShifts(prev => prev.filter(s => s.id !== shiftId));
    };

    const handleSaveLeavePlan = (plan: LeavePlan) => {
        setLeavePlans(prev => {
            const index = prev.findIndex(p => p.id === plan.id);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = plan;
                return updated;
            }
            return [...prev, plan];
        });
    };

    const handleDeleteLeavePlan = (planId: string) => {
        setLeavePlans(prev => prev.filter(p => p.id !== planId));
    };

    const renderView = () => {
        switch (currentView) {
            case View.Dashboard:
                return <Dashboard payslip={selectedPayslip} alert={alert} payslips={payslips} />;
            case View.Upload:
                return <Upload onAnalysisComplete={handleAnalysisComplete} />;
            case View.Archive:
                return <Archive 
                            payslips={payslips} 
                            onSelectPayslip={handleSelectPayslipForDashboard} 
                            onCompare={handleCompare}
                            onDeletePayslip={handleDeletePayslip}
                        />;
            case View.Compare:
                return <Compare payslips={payslipsToCompare} />;
            case View.Assistant:
                return <Assistant payslips={payslips} mode="general" />;
            case View.ShiftPlanner:
                return <ShiftPlanner shifts={shifts} onSave={handleSaveShift} onDelete={handleDeleteShift} />;
            case View.LeavePlanner:
                return <LeavePlanner leavePlans={leavePlans} onSave={handleSaveLeavePlan} onDelete={handleDeleteLeavePlan} />;
            case View.Settings:
                return <Settings user={user!} onSave={handleUpdateUser} />;
            default:
                return <Dashboard payslip={selectedPayslip} alert={alert} payslips={payslips} />;
        }
    };
    
    if (!user) {
        return <Onboarding onSave={setUser} />;
    }

    return (
        <Layout user={user} currentView={currentView} setCurrentView={setCurrentView}>
            {renderView()}
        </Layout>
    );
};

export default App;