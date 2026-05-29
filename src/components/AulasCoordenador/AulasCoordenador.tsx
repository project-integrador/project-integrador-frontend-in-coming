import React, { useState, useEffect } from 'react';
import './AulasCoordenador.css';
import {
    User, Users, LayoutDashboard, LogOut, ShieldCheck, RefreshCw,
    BookOpen, Clock, GraduationCap, Settings, X, Save, Camera, CalendarDays, ChevronDown
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AulaDTO } from '../../dtos/AulaDTO';
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

// ─── Tela de Aulas ────────────────────────────────────────────────────────────

const TelaAulas: React.FC = () => {
    const navigate = useNavigate();
    const [aulas, setAulas] = useState<AulaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [busca, setBusca] = useState('');
    const [professorFiltro, setProfessorFiltro] = useState<number | null>(null);
    const [dropdownAberto, setDropdownAberto] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:8080/aula')
            .then(res => setAulas(Array.isArray(res.data) ? res.data : []))
            .catch(() => setErro('Erro ao carregar aulas. Verifique se o backend está rodando.'))
            .finally(() => setLoading(false));
    }, []);

    // Lista de professores únicos extraída das aulas
    const professoresUnicos = Array.from(
        new Map(
            aulas
                .filter(a => a.professorTitular?.id)
                .map(a => [a.professorTitular!.id, a.professorTitular!])
        ).values()
    );

    const aulasFiltradas = aulas.filter(a => {
        const buscaOk =
            a.nomeDisciplina.toLowerCase().includes(busca.toLowerCase()) ||
            a.professorTitular?.nome?.toLowerCase().includes(busca.toLowerCase());
        const professorOk = professorFiltro === null || a.professorTitular?.id === professorFiltro;
        return buscaOk && professorOk;
    });

    const totalHoras = aulas.reduce((acc, a) => acc + (a.cargaHoraria || 0), 0);

    // Horas do professor selecionado (ou total se nenhum)
    const horasExibidas = professorFiltro === null
        ? totalHoras
        : aulas
            .filter(a => a.professorTitular?.id === professorFiltro)
            .reduce((acc, a) => acc + (a.cargaHoraria || 0), 0);

    const nomeProfessorSelecionado = professorFiltro === null
        ? null
        : professoresUnicos.find(p => p.id === professorFiltro)?.nome || null;

    return (
        <main className="main-content">
            <header className="top-header">
                <div className="header-title">
                    <h1>Aulas</h1>
                    <p>Visualize todas as aulas e filtre por professor titular.</p>
                </div>
                <div className="header-actions">
                    <div className="avatar-top"><User size={20} color="#fff" /></div>
                </div>
            </header>

            <section className="summary-cards">
                <div className="card">
                    <div className="card-icon blue"><BookOpen size={24} /></div>
                    <div className="card-info">
                        <span className="label">Total de Aulas</span>
                        <span className="value">{aulas.length}</span>
                        <span className="desc">Disciplinas cadastradas</span>
                    </div>
                </div>
                <div className="card card-horas-destaque" style={professorFiltro ? { borderColor: '#3b82f6', background: '#eff6ff' } : {}}>
                    <div className="card-icon green"><Clock size={24} /></div>
                    <div className="card-info">
                        <span className="label">
                            {professorFiltro ? `Horas de ${nomeProfessorSelecionado?.split(' ')[0]}` : 'Carga Horária Total'}
                        </span>
                        <span className="value">{horasExibidas}h</span>
                        <span className="desc">
                            {professorFiltro ? 'Somente deste professor' : 'Todos os professores'}
                        </span>
                    </div>
                </div>
                <div className="card">
                    <div className="card-icon yellow"><GraduationCap size={24} /></div>
                    <div className="card-info">
                        <span className="label">Professores</span>
                        <span className="value">{professoresUnicos.length}</span>
                        <span className="desc">Professores com aulas</span>
                    </div>
                </div>
            </section>

            {/* ── Filtro por professor (chips) ── */}
            <section className="professor-filtro-section">
                <div className="professor-filtro-header">
                    <span className="professor-filtro-label">
                        <GraduationCap size={14} /> Filtrar por professor
                    </span>
                    {professorFiltro !== null && (
                        <button className="btn-limpar-filtro" onClick={() => setProfessorFiltro(null)}>
                            <X size={12} /> Limpar filtro
                        </button>
                    )}
                </div>
                <div className="professor-chips">
                    {professoresUnicos.map(p => {
                        const horasProf = aulas
                            .filter(a => a.professorTitular?.id === p.id)
                            .reduce((acc, a) => acc + (a.cargaHoraria || 0), 0);
                        const ativo = professorFiltro === p.id;
                        return (
                            <button
                                key={p.id}
                                className={`professor-chip ${ativo ? 'ativo' : ''}`}
                                onClick={() => setProfessorFiltro(ativo ? null : p.id!)}
                            >
                                <div className="chip-avatar">
                                    <User size={12} />
                                </div>
                                <span className="chip-nome">{p.nome}</span>
                                <span className="chip-horas">{horasProf}h</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <h3>
                        {professorFiltro
                            ? `Aulas de ${nomeProfessorSelecionado} (${aulasFiltradas.length})`
                            : `Lista de Aulas (${aulasFiltradas.length})`
                        }
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            className="input-busca"
                            type="text"
                            placeholder="Buscar disciplina ou professor..."
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                        <button
                            onClick={() => navigate('/coordenador-criar-aulas')}
                            style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            + Gerenciar Aulas
                        </button>
                    </div>
                </div>

                {loading && <p className="loading-text">Carregando...</p>}
                {erro && <div className="alert-error"><strong>🚨</strong> {erro}</div>}

                {!loading && !erro && (
                    <table className="schedule-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Disciplina</th>
                            <th>Carga Horária</th>
                            <th>Professor Titular</th>
                            <th>E-mail do Professor</th>
                        </tr>
                        </thead>
                        <tbody>
                        {aulasFiltradas.length > 0 ? aulasFiltradas.map((a) => (
                            <tr key={a.id} className={professorFiltro === a.professorTitular?.id ? 'row-destaque' : ''}>
                                <td>#{a.id}</td>
                                <td>
                                    <div className="disciplina-cell">
                                        <div className="disciplina-icon"><BookOpen size={14} /></div>
                                        {a.nomeDisciplina}
                                    </div>
                                </td>
                                <td><span className="badge-horas">{a.cargaHoraria}h</span></td>
                                <td>
                                    <button
                                        className={`professor-cell-btn ${professorFiltro === a.professorTitular?.id ? 'ativo' : ''}`}
                                        onClick={() => {
                                            if (a.professorTitular?.id) {
                                                setProfessorFiltro(prev =>
                                                    prev === a.professorTitular!.id ? null : a.professorTitular!.id!
                                                );
                                            }
                                        }}
                                        title="Clique para filtrar por este professor"
                                    >
                                        <div className="avatar-mini-table"><User size={14} color="#64748b" /></div>
                                        {a.professorTitular?.nome || '—'}
                                    </button>
                                </td>
                                <td className="email-cell">{a.professorTitular?.email || '—'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                                    {busca || professorFiltro ? 'Nenhuma aula encontrada para esse filtro.' : 'Nenhuma aula cadastrada.'}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                )}
            </section>
        </main>
    );
};

const AulasCoordenador: React.FC = () => {
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
            <TelaAulas />
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

export default AulasCoordenador;
