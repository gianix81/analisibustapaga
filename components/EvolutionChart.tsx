
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Payslip } from '../types.ts';

interface EvolutionChartProps {
    payslips: Payslip[];
}

const EvolutionChart: React.FC<EvolutionChartProps> = ({ payslips }) => {
    // Sort payslips chronologically (oldest first)
    const sortedPayslips = [...payslips].sort((a, b) => {
        const dateA = new Date(a.period.year, a.period.month - 1);
        const dateB = new Date(b.period.year, b.period.month - 1);
        return dateA.getTime() - dateB.getTime();
    });

    const chartData = sortedPayslips.map(p => ({
        name: `${new Date(p.period.year, p.period.month - 1).toLocaleString('it-IT', { month: 'short' })} ${p.period.year}`,
        'Stipendio Lordo': p.grossSalary,
        'Stipendio Netto': p.netSalary,
        'Trattenute': p.totalDeductions,
    }));

    return (
        <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
                <LineChart
                    data={chartData}
                    margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `€${value}`} />
                    <Tooltip formatter={(value: number) => `€ ${value.toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="Stipendio Lordo" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Stipendio Netto" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="Trattenute" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EvolutionChart;