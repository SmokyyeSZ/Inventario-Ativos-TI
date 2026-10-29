import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const LoginView = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        let response = await fetch(
            'http://localhost:8000/api/token/',
            {method: 'POST',
                headers: {'Content-Type':'application/json'}, 
                body:JSON.stringify({username, password})
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access)
            navigate('/dashboard')
        }
    }
    return (
        <div className='min-h-screen bg-[#070b12] flex flex-col items-center justify-center p-4'>
            <div className='w-full max-w-md bg-[#0b101b] border border-cyan-500/30 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.2)] p-8'>
            
            <h2 className='text-2xl font-bold text-white font-mono text-center mb-6'>
                Acesso Restrito
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
                <input 
                    type="text" 
                    placeholder="Usuário"
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="w-full px-4 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
                
                <input 
                    type="password" 
                    placeholder="Senha"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-[#060911] border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />

                <button className='w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg'>Entrar</button>

            </form>
            </div>
        </div>
    )
}