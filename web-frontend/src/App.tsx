import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ToastContainer from './components/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <LanguageProvider>
                    <ToastProvider>
                        <AuthProvider>
                            <ToastContainer />
                            <Routes>
                                {/* public routes */}
                                <Route path="/login" element={<Login />} />

                                {/* protected routes */}
                                <Route
                                    path="/"
                                    element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* redirect unknown routes to home */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </AuthProvider>
                    </ToastProvider>
                </LanguageProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
