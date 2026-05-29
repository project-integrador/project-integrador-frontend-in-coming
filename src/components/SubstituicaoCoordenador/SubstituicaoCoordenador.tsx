import React, { useState, useEffect } from 'react';
import './SubstituicaoCoordenador.css';
import {
    User, Users, LayoutDashboard,
    LogOut, ShieldCheck, RefreshCw, BookOpen,
    Settings, X, Save, Camera, CalendarDays
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CoordenadorDTO } from '../../dtos/CoordenadorDTO';

interface ModalPerfilProps {
    coordenador: CoordenadorDTO | null;
    fotoUrl: string;
    onClose: () => void;
    onSalvar: (novoNome: string) => void;
    onFotoChange: (base64: string) => void;
}

const ModalPerfil: React.FC<ModalPerfilProps> = ({ coordenador, fotoUrl, onClose, onSalvar, onFotoChange }) => {
    const [nome, setNome] = useState(coordenador?.nome || '');
    const [loading, setLoading] = useState(false);

    const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            const email = localStorage.getItem('userEmail') || '';
            localStorage.setItem(`profilePhoto_${email}`, base64);
            onFotoChange(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nome.trim() || !coordenador?.id) return;
        setLoading(true);
        try {
            await axios.put(`http://localhost:8080/coordenador/${coordenador.id}`, { ...coordenador, nome: nome.trim() });
            onSalvar(nome.trim());
            onClose();
            alert('Perfil atualizado com sucesso!');
        } catch {
            alert('Erro ao atualizar perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box modal-perfil" onClick={e => e.stopPropagation()}>
                <div className="modal-perfil-header">
                    <h3>Configurações de Perfil</h3>
                    <button className="btn-fechar-modal" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="perfil-avatar-grande">
                    <div className="avatar-grande-circulo">
                        {fotoUrl ? <img src={fotoUrl} alt="Perfil" className="avatar-img-grande" /> : <User size={40} color="#64748b" />}
                    </div>
                    <label className="btn-trocar-foto">
                        <Camera size={13} /> Trocar foto
                        <input type="file" accept="image/*" onChange={handleFotoChange} style={{ display: 'none' }} />
                    </label>
                </div>
                <div className="perfil-info-static">
                    <span className="perfil-email-label">E-mail</span>
                    <span className="perfil-email-value">{coordenador?.email || '—'}</span>
                    <span className="perfil-email-label" style={{ marginTop: 8 }}>Matrícula</span>
                    <span className="perfil-email-value">{coordenador?.matricula || '—'}</span>
                </div>
                <form onSubmit={handleSalvar}>
                    <div className="form-group-modal">
                        <label>Nome</label>
                        <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome completo" required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancelar-modal" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-salvar-modal" disabled={loading}>
                            <Save size={14} />{loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface SidebarProps {
    coordenador: CoordenadorDTO | null;
    fotoUrl: string;
    onAbrirPerfil: () => void;
}

const NavegacaoCoordenador: React.FC<SidebarProps> = ({ coordenador, fotoUrl, onAbrirPerfil }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;
    const primeiroNome = coordenador?.nome?.split(' ')[0] || 'Coordenador';

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon-small"><ShieldCheck color="#fff" size={24} /></div>
                <h2>S-<span>RAF</span></h2>
            </div>
            <nav className="sidebar-nav">
                <button className={`nav-item ${isActive('/dashboard-coordenador') ? 'active' : ''}`} onClick={() => navigate('/dashboard-coordenador')}>
                    <LayoutDashboard size={20} /><span>Solicitações</span>
                </button>
                <button className={`nav-item ${isActive('/coordenador-substituicoes') ? 'active' : ''}`} onClick={() => navigate('/coordenador-substituicoes')}>
                    <RefreshCw size={20} /><span>Substituições</span>
                </button>
                <button className={`nav-item ${isActive('/coordenador-aulas') ? 'active' : ''}`} onClick={() => navigate('/coordenador-aulas')}>
                    <BookOpen size={20} /><span>Aulas</span>
                </button>
                <button className={`nav-item ${isActive('/coordenador-usuarios') ? 'active' : ''}`} onClick={() => navigate('/coordenador-usuarios')}>
                    <Users size={20} /><span>Todos os Usuários</span>
                </button>
                <button className={`nav-item ${isActive('/coordenador-calendario') ? 'active' : ''}`} onClick={() => navigate('/coordenador-calendario')}>
                    <CalendarDays size={20} /><span>Calendário</span>
                </button>
            </nav>
            <div className="sidebar-footer">
                <button className="nav-item text-danger" onClick={() => { localStorage.clear(); navigate('/'); }}>
                    <LogOut size={20} /><span>Sair</span>
                </button>
                <button className="user-profile-btn" onClick={onAbrirPerfil}>
                    <div className="avatar-mini">
                        {fotoUrl ? <img src={fotoUrl} alt="Perfil" className="avatar-img" /> : <User size={20} color="#64748b" />}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{primeiroNome}</span>
                        <span className="user-role">Administrador</span>
                    </div>
                    <Settings size={14} className="perfil-settings-icon" />
                </button>
            </div>
        </aside>
    );
};

const TelaSubstituicoes: React.FC = () => {
    const navigate = useNavigate();
    const [substituicoes, setSubstituicoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        axios.get('http://localhost:8080/substituicao')
            .then(res => setSubstituicoes(Array.isArray(res.data) ? res.data : []))
            .catch(() => setErro('Erro ao carregar substituições.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="main-content">
            <header className="top-header">
                <div className="header-title"><h1>Substituições</h1><p>Veja todas as substituições registradas no sistema.</p></div>
                <div className="header-actions"><div className="avatar-top"><User size={20} color="#fff" /></div></div>
            </header>
            <section className="summary-cards">
                <div className="card">
                    <div className="card-icon blue"><RefreshCw size={24} /></div>
                    <div className="card-info"><span className="label">Total</span><span className="value">{substituicoes.length}</span><span className="desc">Substituições registradas</span></div>
                </div>
            </section>
            <section className="panel">
                <div className="panel-header">
                    <h3>Lista de Substituições ({substituicoes.length})</h3>
                    <button className="btn-gerenciar" onClick={() => navigate('/coordenador-gerenciar-substituicoes')}>+ Gerenciar Substituições</button>
                </div>
                {loading && <p className="loading-text">Carregando...</p>}
                {erro && <div className="alert-error"><strong>🚨</strong> {erro}</div>}
                {!loading && !erro && (
                    <table className="schedule-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Professor Substituto</th>
                            <th>Coordenador</th>
                            <th>Prof. Ausente</th>
                            <th>Data Ausência</th>
                            <th>Motivo</th>
                            <th>Aula</th>
                        </tr>
                        </thead>
                        <tbody>
                        {substituicoes.length > 0 ? substituicoes.map((s) => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td>{s.professorSubstituto?.nome || '—'}</td>
                                <td>{s.coordenador?.nome || '—'}</td>
                                <td>{s.solicitacaoAusencia?.professor?.nome || '—'}</td>
                                <td>{s.solicitacaoAusencia?.dataAusencia || '—'}</td>
                                <td>{s.solicitacaoAusencia?.motivo || '—'}</td>
                                <td>{s.solicitacaoAusencia?.aula?.nomeDisciplina || '—'}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Nenhuma substituição registrada.</td></tr>
                        )}
                        </tbody>
                    </table>
                )}
            </section>
        </main>
    );
};

const SubstituicaoCoordenador: React.FC = () => {
    const [coordenador, setCoordenador] = useState<CoordenadorDTO | null>(null);
    const [fotoUrl, setFotoUrl] = useState('');
    const [modalPerfilAberto, setModalPerfilAberto] = useState(false);

    useEffect(() => {
        const email = localStorage.getItem('userEmail') || '';
        if (email) {
            const fotoSalva = localStorage.getItem(`profilePhoto_${email}`);
            if (fotoSalva) setFotoUrl(fotoSalva);
            axios.get(`http://localhost:8080/coordenador?email=${email}`).then(res => setCoordenador(res.data)).catch(() => {});
        }
    }, []);

    return (
        <div className="dashboard-container">
            <NavegacaoCoordenador coordenador={coordenador} fotoUrl={fotoUrl} onAbrirPerfil={() => setModalPerfilAberto(true)} />
            <TelaSubstituicoes />
            {modalPerfilAberto && (
                <ModalPerfil
                    coordenador={coordenador} fotoUrl={fotoUrl}
                    onClose={() => setModalPerfilAberto(false)}
                    onSalvar={(novoNome) => setCoordenador(prev => prev ? { ...prev, nome: novoNome } : prev)}
                    onFotoChange={setFotoUrl}
                />
            )}
        </div>
    );
};

export default SubstituicaoCoordenador;
