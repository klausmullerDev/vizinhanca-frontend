import React from 'react';
import { Link } from 'react-router-dom';
// Importa a imagem de fundo da pasta assets
import BackgroundImage from '../assets/Background2.png';

const LandingPage: React.FC = () => {
    return (
        <div
            className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${BackgroundImage})` }}
        >
            <header className="shadow-sm bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">Vizinhança Solidária</h1>
                    <div>
                        <Link to="/login" className="text-indigo-600 font-semibold mr-4 hover:underline">Login</Link>
                        <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">Cadastre-se</Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-6 flex flex-col lg:flex-row items-center justify-center py-12">
                <div className="lg:w-1/2 text-center lg:text-left p-8 rounded-lg">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        Conectando vizinhos, <br />
                        <span className="text-indigo-700">fortalecendo comunidades.</span>
                    </h2>
                    <p className="mt-6 max-w-xl text-lg text-gray-700 mx-auto lg:mx-0">
                        Peça ajuda, ofereça apoio e redescubra o poder da sua vizinhança.
                    </p>
                    <div className="mt-8">
                        <Link to="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-indigo-700 shadow-lg transition-transform hover:scale-105 inline-block">
                            Comece Agora
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;