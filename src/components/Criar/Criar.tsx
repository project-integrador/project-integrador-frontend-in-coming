import React, { useState } from 'react';
import {
    User, Lock, Eye, EyeOff, GraduationCap,
    ShieldCheck, ArrowLeft, Phone, Hash, BookOpen
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Criar.css';

const Criar: React.FC = () => {

    const navigate = useNavigate();

    const [tipo, setTipo] = useState<'PROFESSOR' | 'COORDENADOR'>('PROFESSOR');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        nome: '',
        email: '',
        password: '',
        matricula: '',
        telefone: '',
        areaAtuacao: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = tipo === 'PROFESSOR'
                ? 'http://localhost:8080/professor'
                : 'http://localhost:8080/coordenador';

            const payload = tipo === 'PROFESSOR'
                ? { ...form, ativo: true }
                : { nome: form.nome, email: form.email, password: form.password, matricula: form.matricula, telefone: form.telefone, ativo: true };

            await axios.post(url, payload);
            alert('Conta criada com sucesso!');
            navigate('/');

        } catch (error) {
            alert('Erro ao criar conta. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
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
                            Crie sua conta no <span>S-RAF</span>
                        </h2>
                        <p>
                            Cadastre-se como professor ou coordenador e
                            faça parte do sistema de gestão de substituições.
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

                    {/* VOLTAR */}
                    <button className="btn-voltar-login" onClick={() => navigate('/')}>
                        <ArrowLeft size={16} />
                        Voltar ao login
                    </button>

                    <div className="user-avatar">
                        <User size={40} color="#3b82f6" />
                    </div>

                    <h1>Criar conta</h1>
                    <p className="subtitle">Preencha os dados para se cadastrar</p>

                    {/* TOGGLE TIPO */}
                    <div className="tipo-toggle">
                        <button
                            type="button"
                            className={`tipo-btn ${tipo === 'PROFESSOR' ? 'active' : ''}`}
                            onClick={() => setTipo('PROFESSOR')}
                        >
                            <GraduationCap size={18} />
                            Professor
                        </button>
                        <button
                            type="button"
                            className={`tipo-btn ${tipo === 'COORDENADOR' ? 'active' : ''}`}
                            onClick={() => setTipo('COORDENADOR')}
                        >
                            <ShieldCheck size={18} />
                            Coordenador
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* NOME */}
                        <div className="input-group">
                            <label>Nome completo</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={20} />
                                <input
                                    type="text"
                                    name="nome"
                                    placeholder="Digite seu nome completo"
                                    value={form.nome}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div className="input-group">
                            <label>E-mail</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Digite seu e-mail"
                                    value={form.email}
                                    onChange={handleChange}
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
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Crie uma senha"
                                    value={form.password}
                                    onChange={handleChange}
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

                        {/* MATRÍCULA */}
                        <div className="input-group">
                            <label>Matrícula</label>
                            <div className="input-wrapper">
                                <Hash className="input-icon" size={20} />
                                <input
                                    type="text"
                                    name="matricula"
                                    placeholder="Digite sua matrícula"
                                    value={form.matricula}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* TELEFONE */}
                        <div className="input-group">
                            <label>Telefone</label>
                            <div className="input-wrapper">
                                <Phone className="input-icon" size={20} />
                                <input
                                    type="text"
                                    name="telefone"
                                    placeholder="(00) 00000-0000"
                                    value={form.telefone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* ÁREA DE ATUAÇÃO — só Professor */}
                        {tipo === 'PROFESSOR' && (
                            <div className="input-group">
                                <label>Área de Atuação</label>
                                <div className="input-wrapper">
                                    <BookOpen className="input-icon" size={20} />
                                    <input
                                        type="text"
                                        name="areaAtuacao"
                                        placeholder="Ex: Matemática, Física..."
                                        value={form.areaAtuacao}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={loading}>
                            <User size={18} />
                            {loading ? ' Criando conta...' : ' Criar conta'}
                        </button>

                    </form>

                </div>

                <footer className="main-footer">
                    © 2024 S-RAF. Todos os direitos reservados.
                </footer>
            </div>

        </div>
    );
};

export default Criar;