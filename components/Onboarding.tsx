import React, { useState } from 'react';
import { User } from '../types.ts';
import { LogoIcon } from './common/Icons.tsx';

interface OnboardingProps {
    onSave: (user: User) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onSave }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        placeOfBirth: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { firstName, lastName, dateOfBirth, placeOfBirth } = formData;
        if (!firstName || !lastName || !dateOfBirth || !placeOfBirth) {
            setError('Tutti i campi sono obbligatori.');
            return;
        }
        onSave({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dateOfBirth: dateOfBirth.trim(),
            placeOfBirth: placeOfBirth.trim(),
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center space-x-2 text-blue-600">
                        <LogoIcon />
                        <span className="font-bold text-2xl">PayAnalyst</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mt-4">Benvenuto!</h2>
                    <p className="text-gray-500 text-center mt-1">Inserisci i tuoi dati per iniziare. Saranno usati per verificare la corrispondenza con le tue buste paga.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-600">Nome</label>
                            <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" required />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-600">Cognome</label>
                            <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" required />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-600">Data di Nascita</label>
                        <input type="date" name="dateOfBirth" id="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" required />
                    </div>
                     <div>
                        <label htmlFor="placeOfBirth" className="block text-sm font-medium text-gray-600">Luogo di Nascita</label>
                        <input type="text" name="placeOfBirth" id="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900" required />
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="pt-4">
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Salva e Continua
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;