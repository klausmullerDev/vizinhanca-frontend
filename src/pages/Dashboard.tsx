import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Bem-vindo(a), {user?.name}!</h1>
                <p className="text-gray-600 mb-6">Esta é sua área logada. A partir daqui, você poderá ver e criar pedidos de ajuda.</p>
                <button
                    onClick={logout}
                    className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition duration-300"
                >
                    Sair
                </button>
            </div>
        </div>
    );
}

export default Dashboard;

