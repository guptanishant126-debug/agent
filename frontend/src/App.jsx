import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ConsultPage from './pages/ConsultPage';
import ScamShieldPage from './pages/ScamShieldPage';
import RecoursePage from './pages/RecoursePage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-emerald-500 selection:text-white">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/scam-shield" element={<ScamShieldPage />} />

                {/* Core App Routes (Secured by JWT Authentication) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consult"
                  element={
                    <ProtectedRoute>
                      <ConsultPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recourse"
                  element={
                    <ProtectedRoute>
                      <RecoursePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <HistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">
                    S
                  </div>
                  <span className="font-bold text-slate-200">Sahayak AI</span>
                  <span>• The Rural & Small Business AI Guardian</span>
                </div>
                <div className="flex items-center space-x-6">
                  <a href="tel:1930" className="hover:text-amber-400 font-bold transition">
                    🚨 Cyber Helpline 1930
                  </a>
                  <a href="tel:18001801551" className="hover:text-emerald-400 font-bold transition">
                    🌾 Kisan 1800-180-1551
                  </a>
                  <a href="tel:1915" className="hover:text-blue-400 font-bold transition">
                    ⚖️ Consumer 1915
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
