import React, { useState } from 'react';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    GraduationCap,
    UserPlus,
    ArrowRight
} from 'lucide-react';

import { login } from '../../fetch/AuthRequests';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login: React.FC = () => {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        setLoading(true);

        try {

            const response = await login({ email, password });

            const { token, role } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRole', role);

            setTimeout(() => {

                if (role === 'COORDENADOR') {
                    navigate('/dashboard-coordenador');
                } else {
                    navigate('/dashboard-professor');
                }

            }, 1800);

        } catch (error) {

            alert('Email ou senha inválidos.');
            setLoading(false);

        }

    };

    // LOADING SCREEN
    if (loading) {

        return (

            <div className="loading-screen">

                <div className="particles"></div>

                <div className="loading-logo">

                    <div className="loading-circle"></div>

                    <h1>S-RAF</h1>

                    <p>Entrando no sistema...</p>

                </div>

            </div>

        );

    }

    return (

        <div className="login-container">

            {/* FUNDO ANIMADO */}
            <div className="bg-blur blur-1"></div>
            <div className="bg-blur blur-2"></div>
            <div className="bg-blur blur-3"></div>

            {/* SIDEBAR */}
            <div className="login-sidebar">

                <div className="sidebar-overlay"></div>

                <div className="sidebar-content">

                    <div className="logo-section">

                        <div className="logo-icon">
                            <User color="#fff" size={30} />
                        </div>

                        <h1>
                            S-<span>RAF</span>
                        </h1>

                    </div>

                    <div className="sidebar-text">

                        <span className="tag-system">
                            Plataforma Acadêmica
                        </span>

                        <h2>
                            Gestão moderna para
                            <span> substituição docente</span>
                        </h2>

                        <p>
                            Organize solicitações, acompanhe substituições
                            e mantenha o ensino funcionando com eficiência.
                        </p>

                    </div>

                    <div className="floating-cards">

                        <div className="mini-card">
                            <GraduationCap size={18} />
                            <span>+120 docentes ativos</span>
                        </div>

                        <div className="mini-card delay">
                            <Lock size={18} />
                            <span>Ambiente seguro</span>
                        </div>

                    </div>

                </div>

            </div>

            {/* LOGIN */}
            <div className="login-main">

                <div className="login-card">

                    <div className="card-glow"></div>

                    <div className="user-avatar">
                        <User size={38} color="#3b82f6" />
                    </div>

                    <h1>Bem-vindo(a)</h1>

                    <p className="subtitle">
                        Faça login para acessar o sistema
                    </p>

                    <form onSubmit={handleSubmit}>

                        {/* EMAIL */}
                        <div className="input-group">

                            <label>E-mail</label>

                            <div className="input-wrapper">

                                <User className="input-icon" size={18} />

                                <input
                                    type="email"
                                    placeholder="Digite seu e-mail"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                            </div>

                        </div>

                        {/* SENHA */}
                        <div className="input-group">

                            <label>Senha</label>

                            <div className="input-wrapper">

                                <Lock className="input-icon" size={18} />

                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Digite sua senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>

                            </div>

                        </div>

                        {/* BOTÃO LOGIN */}
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >

                            <span>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </span>

                            <ArrowRight size={18} />

                        </button>

                    </form>

                    {/* DIVIDER */}
                    <div className="divider">
                        <span>Novo no sistema?</span>
                    </div>

                    {/* CADASTRO */}
                    <button
                        type="button"
                        className="btn-register"
                        onClick={() => navigate('/cadastro')}
                    >

                        <UserPlus size={18} />

                        Criar nova conta

                    </button>

                </div>

                <footer className="main-footer">
                    © 2026 S-RAF • Plataforma Acadêmica
                </footer>

            </div>

        </div>

    );

};

export default Login;