import React, { useState, useEffect } from 'react';
import './DashboardCoordenador.css';
import {
    User, Users, FileText,
    CheckCircle, XCircle, LayoutDashboard,
    LogOut, ClipboardList, ShieldCheck, RefreshCw, BookOpen, UserPlus,
    Settings, X, Save, Camera, CalendarDays
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import { SolicitacaoAusenciaDTO } from '../../dtos/SolicitacaoAusenciaDTO';
import { CoordenadorDTO } from '../../dtos/CoordenadorDTO';
import { ProfessorDTO } from '../../dtos/ProfessorDTO';
import { AulaDTO } from '../../dtos/AulaDTO';

// ─── Modal de Perfil ──────────────────────────────────────────────────────────

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
            await axios.put(`http://localhost:8080/coordenador/${coordenador.id}`, {
                ...coordenador,
                nome: nome.trim(),
            });
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
                        {fotoUrl
                            ? <img src={fotoUrl} alt="Perfil" className="avatar-img-grande" />
                            : <User size={40} color="#64748b" />
                        }
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
                        <input
                            type="text"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            placeholder="Seu nome completo"
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-cancelar-modal" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-salvar-modal" disabled={loading}>
                            <Save size={14} />
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

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
                <div className="logo-icon-small">
                    <ShieldCheck color="#fff" size={24} />
                </div>
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
                        {fotoUrl
                            ? <img src={fotoUrl} alt="Perfil" className="avatar-img" />
                            : <User size={20} color="#64748b" />
                        }
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

// ─── Tela: Solicitações ───────────────────────────────────────────────────────

const TelaSolicitacoes: React.FC<{ coordenador: CoordenadorDTO | null }> = ({ coordenador }) => {
    const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAusenciaDTO[]>([]);
    const [professores, setProfessores] = useState<ProfessorDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState<SolicitacaoAusenciaDTO | null>(null);
    const [professorSubstitutoId, setProfessorSubstitutoId] = useState('');
    const [loadingDesignar, setLoadingDesignar] = useState(false);

    const carregar = async () => {
        try {
            const [resSol, resProf] = await Promise.all([
                axios.get('http://localhost:8080/solicitacao/todas'),
                axios.get('http://localhost:8080/professor/todos'),
            ]);
            setSolicitacoes(Array.isArray(resSol.data) ? resSol.data : []);
            setProfessores(Array.isArray(resProf.data) ? resProf.data : []);
        } catch {
            setErro('Erro ao carregar dados. Verifique se o backend está rodando.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregar(); }, []);

    const formatarData = (dataStr: string) => {
        if (!dataStr) return '—';
        const [a, m, d] = dataStr.split('-');
        return `${d}/${m}/${a}`;
    };

    const handleAcao = async (id: number | undefined, acao: 'APROVADO' | 'RECUSADO') => {
        if (!id) return;
        try {
            await axios.patch(`http://localhost:8080/solicitacao/${id}/status`, { status: acao });
            setSolicitacoes(prev => prev.map(s => s.id === id ? { ...s, status: acao } : s));
        } catch {
            alert('Erro ao atualizar status.');
        }
    };

    const abrirModalDesignar = (solicitacao: SolicitacaoAusenciaDTO) => {
        setSolicitacaoSelecionada(solicitacao);
        setProfessorSubstitutoId('');
        setModalAberto(true);
    };

    const handleDesignarSubstituto = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!professorSubstitutoId) { alert('Selecione um professor substituto.'); return; }
        if (!coordenador?.id) { alert('Coordenador não identificado.'); return; }
        if (!solicitacaoSelecionada?.id) return;
        setLoadingDesignar(true);
        try {
            await axios.post('http://localhost:8080/substituicao', {
                coordenador: { id: coordenador.id },
                professorSubstituto: { id: parseInt(professorSubstitutoId) },
                solicitacaoAusencia: { id: solicitacaoSelecionada.id },
            });
            setSolicitacoes(prev =>
                prev.map(s => s.id === solicitacaoSelecionada.id ? { ...s, status: 'RESOLVIDA' } : s)
            );
            setModalAberto(false);
            setSolicitacaoSelecionada(null);
            alert('Substituto designado com sucesso!');
        } catch {
            alert('Erro ao designar substituto.');
        } finally {
            setLoadingDesignar(false);
        }
    };

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            PENDENTE: 'badge-pendente',
            APROVADO: 'badge-aprovado',
            RECUSADO: 'badge-recusado',
            RESOLVIDA: 'badge-resolvida',
        };
        return map[status] || 'badge-pendente';
    };

    return (
        <main className="main-content">
            <header className="top-header">
                <div className="header-title">
                    <h1>Solicitações de Ausência</h1>
                    <p>Analise e responda as solicitações dos professores.</p>
                </div>
                <div className="header-actions">
                    <div className="avatar-top"><User size={20} color="#fff" /></div>
                </div>
            </header>

            <section className="summary-cards">
                <div className="card">
                    <div className="card-icon blue"><ClipboardList size={24} /></div>
                    <div className="card-info">
                        <span className="label">Total</span>
                        <span className="value">{solicitacoes.length}</span>
                        <span className="desc">Solicitações recebidas</span>
                    </div>
                </div>
                <div className="card">
                    <div className="card-icon yellow"><FileText size={24} /></div>
                    <div className="card-info">
                        <span className="label">Pendentes</span>
                        <span className="value">{solicitacoes.filter(s => s.status === 'PENDENTE').length}</span>
                        <span className="desc">Aguardando análise</span>
                    </div>
                </div>
                <div className="card">
                    <div className="card-icon green"><CheckCircle size={24} /></div>
                    <div className="card-info">
                        <span className="label">Aprovadas</span>
                        <span className="value">{solicitacoes.filter(s => s.status === 'APROVADO').length}</span>
                        <span className="desc">Substituição confirmada</span>
                    </div>
                </div>
                <div className="card">
                    <div className="card-icon red"><XCircle size={24} /></div>
                    <div className="card-info">
                        <span className="label">Recusadas</span>
                        <span className="value">{solicitacoes.filter(s => s.status === 'RECUSADO').length}</span>
                        <span className="desc">Não autorizadas</span>
                    </div>
                </div>
            </section>

            <section className="panel">
                <div className="panel-header">
                    <h3>Lista de Solicitações</h3>
                </div>

                {loading && <p className="loading-text">Carregando...</p>}
                {erro && <div className="alert-error"><strong>🚨</strong> {erro}</div>}

                {!loading && !erro && (
                    <table className="schedule-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Data Ausência</th>
                            <th>Motivo</th>
                            <th>Professor</th>
                            <th>Aula</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {solicitacoes.length > 0 ? solicitacoes.map((s) => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td>{formatarData(s.dataAusencia)}</td>
                                <td>{s.motivo}</td>
                                <td>{s.professor.nome || `#${s.professor.id}`}</td>
                                <td>{s.aula.nomeDisciplina || `#${s.aula.id}`}</td>
                                <td><span className={statusBadge(s.status)}>{s.status}</span></td>
                                <td className="acoes-cell">
                                    {s.status === 'PENDENTE' && (
                                        <>
                                            <button className="btn-aprovar" onClick={() => handleAcao(s.id, 'APROVADO')}>
                                                <CheckCircle size={16} /> Aprovar
                                            </button>
                                            <button className="btn-recusar" onClick={() => handleAcao(s.id, 'RECUSADO')}>
                                                <XCircle size={16} /> Recusar
                                            </button>
                                        </>
                                    )}
                                    {s.status === 'APROVADO' && (
                                        <button className="btn-designar" onClick={() => abrirModalDesignar(s)}>
                                            <UserPlus size={16} /> Designar Substituto
                                        </button>
                                    )}
                                    {(s.status === 'RECUSADO' || s.status === 'RESOLVIDA') && (
                                        <span className="txt-processado">Processado</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                    Nenhuma solicitação encontrada.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                )}
            </section>

            {/* Modal Designar Substituto */}
            {modalAberto && solicitacaoSelecionada && (
                <div className="modal-overlay" onClick={() => setModalAberto(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>Designar Substituto</h3>
                        <p className="modal-sub">
                            Solicitação #{solicitacaoSelecionada.id} — Ausência em {formatarData(solicitacaoSelecionada.dataAusencia)}
                        </p>
                        <div className="modal-info-row">
                            <span className="modal-info-label">Professor</span>
                            <span className="modal-info-value">
                                {solicitacaoSelecionada.professor.nome || `#${solicitacaoSelecionada.professor.id}`}
                            </span>
                        </div>
                        <div className="modal-info-row">
                            <span className="modal-info-label">Aula</span>
                            <span className="modal-info-value">
                                {solicitacaoSelecionada.aula.nomeDisciplina || `#${solicitacaoSelecionada.aula.id}`}
                            </span>
                        </div>
                        <div className="modal-info-row">
                            <span className="modal-info-label">Motivo</span>
                            <span className="modal-info-value">{solicitacaoSelecionada.motivo}</span>
                        </div>
                        <form onSubmit={handleDesignarSubstituto}>
                            <div className="form-group-modal">
                                <label>Professor Substituto</label>
                                <select
                                    value={professorSubstitutoId}
                                    onChange={e => setProfessorSubstitutoId(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Selecione um professor</option>
                                    {professores.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.nome} — {p.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar-modal" onClick={() => setModalAberto(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-salvar-modal" disabled={loadingDesignar}>
                                    {loadingDesignar ? 'Designando...' : 'Confirmar Substituto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
};

// ─── Tela: Substituições ──────────────────────────────────────────────────────

const TelaSubstituicoes: React.FC = () => {
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
                <div className="header-title">
                    <h1>Substituições</h1>
                    <p>Veja todas as substituições registradas no sistema.</p>
                </div>
                <div className="header-actions">
                    <div className="avatar-top"><User size={20} color="#fff" /></div>
                </div>
            </header>
            <section className="summary-cards">
                <div className="card">
                    <div className="card-icon blue"><RefreshCw size={24} /></div>
                    <div className="card-info">
                        <span className="label">Total</span>
                        <span className="value">{substituicoes.length}</span>
                        <span className="desc">Substituições registradas</span>
                    </div>
                </div>
            </section>
            <section className="panel">
                <div className="panel-header">
                    <h3>Lista de Substituições ({substituicoes.length})</h3>
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
                            <th>Solicitação ID</th>
                            <th>Data Ausência</th>
                            <th>Motivo</th>
                        </tr>
                        </thead>
                        <tbody>
                        {substituicoes.length > 0 ? substituicoes.map((s) => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td>{s.professorSubstituto?.nome || '—'}</td>
                                <td>{s.coordenador?.nome || '—'}</td>
                                <td>{s.solicitacaoAusencia?.id || '—'}</td>
                                <td>{s.solicitacaoAusencia?.dataAusencia || '—'}</td>
                                <td>{s.solicitacaoAusencia?.motivo || '—'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                    Nenhuma substituição registrada.
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

// ─── Tela: Aulas ──────────────────────────────────────────────────────────────

const TelaAulas: React.FC = () => {
    const navigate = useNavigate();
    const [aulas, setAulas] = useState<AulaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);
    const [busca, setBusca] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8080/aula')
            .then(res => setAulas(Array.isArray(res.data) ? res.data : []))
            .catch(() => setErro('Erro ao carregar aulas.'))
            .finally(() => setLoading(false));
    }, []);

    const aulasFiltradas = aulas.filter(a =>
        a.nomeDisciplina.toLowerCase().includes(busca.toLowerCase()) ||
        a.professorTitular?.nome?.toLowerCase().includes(busca.toLowerCase())
    );
    const totalHoras = aulas.reduce((acc, a) => acc + (a.cargaHoraria || 0), 0);

    return (
        <main className="main-content">
            <header className="top-header">
                <div className="header-title">
                    <h1>Aulas</h1>
                    <p>Visualize todas as aulas e seus professores titulares.</p>
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
                <div className="card">
                    <div className="card-icon green"><ClipboardList size={24} /></div>
                    <div className="card-info">
                        <span className="label">Carga Horária Total</span>
                        <span className="value">{totalHoras}h</span>
                        <span className="desc">Horas somadas</span>
                    </div>
                </div>
                <div className="card">
                    <div className="card-icon yellow"><Users size={24} /></div>
                    <div className="card-info">
                        <span className="label">Professores</span>
                        <span className="value">{new Set(aulas.map(a => a.professorTitular?.id)).size}</span>
                        <span className="desc">Professores com aulas</span>
                    </div>
                </div>
            </section>
            <section className="panel">
                <div className="panel-header">
                    <h3>Lista de Aulas ({aulasFiltradas.length})</h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                            className="input-busca"
                            type="text"
                            placeholder="Buscar por disciplina ou professor..."
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
                            <th>ID</th><th>Disciplina</th><th>Carga Horária</th>
                            <th>Professor Titular</th><th>E-mail do Professor</th>
                        </tr>
                        </thead>
                        <tbody>
                        {aulasFiltradas.length > 0 ? aulasFiltradas.map((a) => (
                            <tr key={a.id}>
                                <td>{a.id}</td>
                                <td>{a.nomeDisciplina}</td>
                                <td><span className="badge-horas">{a.cargaHoraria}h</span></td>
                                <td>{a.professorTitular?.nome || '—'}</td>
                                <td>{a.professorTitular?.email || '—'}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                    {busca ? 'Nenhuma aula encontrada para essa busca.' : 'Nenhuma aula cadastrada.'}
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

// ─── Tela: Todos os Usuários ──────────────────────────────────────────────────

const TelaUsuarios: React.FC = () => {
    const navigate = useNavigate();
    const [professores, setProfessores] = useState<ProfessorDTO[]>([]);
    const [coordenadores, setCoordenadores] = useState<CoordenadorDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [resP, resC] = await Promise.all([
                    axios.get('http://localhost:8080/professor/todos'),
                    axios.get('http://localhost:8080/coordenador/todos'),
                ]);
                setProfessores(Array.isArray(resP.data) ? resP.data : []);
                setCoordenadores(Array.isArray(resC.data) ? resC.data : []);
            } catch {
                setErro('Erro ao carregar usuários.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    return (
        <main className="main-content">
            <header className="top-header">
                <div className="header-title">
                    <h1>Todos os Usuários</h1>
                    <p>Visualize todos os professores e coordenadores cadastrados no sistema.</p>
                </div>
                <div className="header-actions">
                    <div className="avatar-top"><User size={20} color="#fff" /></div>
                </div>
            </header>
            {loading && <p className="loading-text">Carregando...</p>}
            {erro && <div className="alert-error"><strong>🚨</strong> {erro}</div>}
            {!loading && !erro && (
                <>
                    <section className="panel" style={{ marginBottom: '24px' }}>
                        <div className="panel-header">
                            <h3>Professores ({professores.length})</h3>
                            <button
                                onClick={() => navigate('/coordenador-gerenciar-professores')}
                                style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                + Gerenciar Professores
                            </button>
                        </div>
                        <table className="schedule-table">
                            <thead>
                            <tr>
                                <th>ID</th><th>Nome</th><th>E-mail</th>
                                <th>Matrícula</th><th>Área</th><th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {professores.map((p, i) => (
                                <tr key={i}>
                                    <td>{p.id}</td>
                                    <td>{p.nome}</td>
                                    <td>{p.email}</td>
                                    <td>{p.matricula}</td>
                                    <td>{(p as any).areaAtuacao || '—'}</td>
                                    <td>
                                            <span className={p.ativo ? 'badge-ativo' : 'badge-inativo'}>
                                                {p.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </section>
                    <section className="panel">
                        <div className="panel-header">
                            <h3>Coordenadores ({coordenadores.length})</h3>
                        </div>
                        <table className="schedule-table">
                            <thead>
                            <tr>
                                <th>ID</th><th>Nome</th><th>E-mail</th>
                                <th>Matrícula</th><th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {coordenadores.map((c, i) => (
                                <tr key={i}>
                                    <td>{c.id}</td>
                                    <td>{c.nome}</td>
                                    <td>{c.email}</td>
                                    <td>{c.matricula}</td>
                                    <td>
                                            <span className={c.ativo ? 'badge-ativo' : 'badge-inativo'}>
                                                {c.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </section>
                </>
            )}
        </main>
    );
};

// ─── Layout Principal ─────────────────────────────────────────────────────────

const DashboardCoordenador: React.FC = () => {
    const location = useLocation();
    const [coordenador, setCoordenador] = useState<CoordenadorDTO | null>(null);
    const [fotoUrl, setFotoUrl] = useState('');
    const [modalPerfilAberto, setModalPerfilAberto] = useState(false);

    useEffect(() => {
        const email = localStorage.getItem('userEmail') || '';
        if (email) {
            const fotoSalva = localStorage.getItem(`profilePhoto_${email}`);
            if (fotoSalva) setFotoUrl(fotoSalva);
            axios.get(`http://localhost:8080/coordenador?email=${email}`)
                .then(res => setCoordenador(res.data))
                .catch(() => {});
        }
    }, []);

    const handleSalvarNome = (novoNome: string) => {
        setCoordenador(prev => prev ? { ...prev, nome: novoNome } : prev);
    };

    const renderConteudo = () => {
        switch (location.pathname) {
            case '/coordenador-substituicoes': return <TelaSubstituicoes />;
            case '/coordenador-aulas': return <TelaAulas />;
            case '/coordenador-usuarios': return <TelaUsuarios />;
            default: return <TelaSolicitacoes coordenador={coordenador} />;
        }
    };

    return (
        <div className="dashboard-container">
            <NavegacaoCoordenador
                coordenador={coordenador}
                fotoUrl={fotoUrl}
                onAbrirPerfil={() => setModalPerfilAberto(true)}
            />
            {renderConteudo()}
            {modalPerfilAberto && (
                <ModalPerfil
                    coordenador={coordenador}
                    fotoUrl={fotoUrl}
                    onClose={() => setModalPerfilAberto(false)}
                    onSalvar={handleSalvarNome}
                    onFotoChange={setFotoUrl}
                />
            )}
        </div>
    );
};

export default DashboardCoordenador;