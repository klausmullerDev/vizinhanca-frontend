import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Ui/Loader'; // Importe seu componente de loading

type ProtectedRouteProps = {
    children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {

    const { isAuthenticated, loading } = useAuth();


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }


    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }


    return <>{children}</>;
};

export default ProtectedRoute;