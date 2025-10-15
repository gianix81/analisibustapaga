
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Payslip } from '../types.ts';

interface SalaryChartProps {
    payslip: Payslip;
}

const SalaryChart: React.FC<SalaryChartProps> = ({ payslip }) => {
    const totalTaxes = payslip.taxData.netTax + payslip.taxData.regionalSurtax + payslip.taxData.municipalSurtax;

    const data = [
        { name: 'Netto in Busta', value: payslip.netSalary, color: '#10B981' }, // green-500
        { name: 'Contributi INPS', value: payslip.socialSecurityData.employeeContribution, color: '#F59E0B' }, // amber-500
        { name: 'Imposte (IRPEF etc.)', value: totalTaxes, color: '#EF4444' }, // red-500
    ];

    return (
        <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `€ ${value.toFixed(2)}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalaryChart;