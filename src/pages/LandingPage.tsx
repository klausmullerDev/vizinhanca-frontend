import React from 'react';
import { Link } from 'react-router-dom'; 


const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <header className="shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Vizinhança Solidária</h1>
                    <div>
                        
                        <Link to="/login" className="text-indigo-600 font-semibold mr-4">Login</Link>
                        <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Cadastre-se</Link>
                    </div>
                </div>
            </header>
            <main className="flex-grow flex flex-col justify-center items-center text-center px-6">
                <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                    Conectando vizinhos, <br />
                    <span className="text-indigo-600">fortalecendo comunidades.</span>
                </h2>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                    Peça ajuda, ofereça apoio e redescubra o poder da sua vizinhança.
                </p>
                <div className="mt-8">
                    <Link to="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-indigo-700 shadow-lg">
                        Comece Agora
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;