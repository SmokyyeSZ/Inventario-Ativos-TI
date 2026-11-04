import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginOnServer } from '../services/api';

interface LoginViewProps {
    onLoginSuccess?: () => Promise<void> | void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await loginOnServer(username, password);
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);
            if (onLoginSuccess) {
                await onLoginSuccess();
            }
            navigate('/dashboard');
        } catch {
            setError('Usuário ou senha incorretos, ou servidor indisponível.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-[#070b12] flex flex-col items-center justify-center p-4'>
            <div className='w-full max-w-md bg-[#0b101b] border border-cyan-500/30 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] p-8'>
            
            <h2 className='text-2xl font-bold text-white font-mono text-center mb-6'>
                Acesso Restrito
            </h2>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs font-mono text-rose-300 text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <input 
                    type="text" 
                    placeholder="Usuário"
                    required
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="w-full px-4 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                
                <input 
                    type="password" 
                    placeholder="Senha"
                    required
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className='w-full py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white rounded-lg cursor-pointer transition-colors'
                >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>

            </form>
            </div>
        </div>
    );
};
