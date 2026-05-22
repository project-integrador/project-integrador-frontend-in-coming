import React, { useState } from 'react';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    GraduationCap,
    ShieldCheck,
    UserPlus
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
        try {
            const response = await login({ email, password });
            const { token, role } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRole', role);

            if (role === 'COORDENADOR') {
                navigate('/dashboard-coordenador');
            } else {
                navigate('/dashboard-professor');
            }
        } catch (error) {
            alert("Email ou senha inválidos.");
        }
    };

    return (
        <div className="login-container">

            {/* LADO ESQUERDO */}
            <div className="login-sidebar">
                <div className="sidebar-content">

                    <div className="logo-section">
                        <div className="logo-icon">
                            <User color="#fff" size={32} />
                        </div>
                        <h1>S-<span>RAF</span></h1>
                    </div>

                    <div className="sidebar-text">
                        <h2>
                            Sistema de Substituição de <span>Docentes</span>
                        </h2>
                        <p>
                            Mais agilidade na gestão de substituições,
                            garantindo continuidade no ensino com eficiência e confiança.
                        </p>
                    </div>

                    <div className="sidebar-footer">
                        <GraduationCap size={40} className="footer-icon" />
                        <div>
                            <p>Gestão inteligente.</p>
                            <p>Ensino que <strong>não para.</strong></p>
                        </div>
                    </div>

                </div>
            </div>

            {/* LADO DIREITO */}
            <div className="login-main">

                <div className="login-card">

                    <div className="user-avatar">
                        <User size={40} color="#3b82f6" />
                    </div>

                    <h1>Bem-vindo(a)!</h1>
                    <p className="subtitle">Faça login para acessar o S-RAF</p>

                    <form onSubmit={handleSubmit}>

                        {/* EMAIL */}
                        <div className="input-group">
                            <label>E-mail</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={20} />
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
                                <Lock className="input-icon" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
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
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* OPÇÕES */}
                        <div className="form-options">
                            <label className="checkbox-container">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Lembrar meu acesso
                            </label>
                            <a href="#" className="forgot-password">
                                Esqueci minha senha
                            </a>
                        </div>

                        {/* BOTÃO ENTRAR */}
                        <button type="submit" className="btn-primary" disabled={loading}>
                            <Lock size={18} />
                            {loading ? " Entrando..." : " Entrar"}
                        </button>

                    </form>

                    {/* DIVIDER */}
                    <div className="divider">
                        <span>ou continue com</span>
                    </div>

                    {/* SSO */}
                    <button type="button" className="btn-sso">
                        <ShieldCheck size={20} color="#1e40af" />
                        Acessar com SSO
                    </button>

                    {/* DIVIDER CRIAR CONTA */}
                    <div className="divider">
                        <span>não tem uma conta?</span>
                    </div>

                    {/* CRIAR CONTA */}
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
                    © 2026 S-RAF. Todos os direitos reservados.
                </footer>

            </div>

        </div>
    );
};

export default Login;