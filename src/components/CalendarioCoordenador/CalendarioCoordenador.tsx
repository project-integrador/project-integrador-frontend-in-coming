import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    ShieldCheck, Users, LayoutDashboard, RefreshCw,
    BookOpen, LogOut, User, Settings, X, Save, Camera,
    CalendarDays, ChevronLeft, ChevronRight
} from 'lucide-react';
import { CoordenadorDTO } from '../../dtos/CoordenadorDTO';
import { SolicitacaoAusenciaDTO } from '../../dtos/SolicitacaoAusenciaDTO';
import './CalendarioCoordenador.css';

const MESES = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const statusCor: Record<string, string> = {
    PENDENTE: '#f59e0b',
    APROVADO: '#22c55e',
    RECUSADO: '#f43f5e',
    RESOLVIDA: '#8b5cf6',
};

interface EventoCalendario {
    data: string;
    motivo: string;
    status: string;
    aulaNome: string;
    professorNome: string;
}
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

// ─── Componente Principal ─────────────────────────────────────────────────────

const CalendarioCoordenador: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const [coordenador, setCoordenador] = useState<CoordenadorDTO | null>(null);
    const [fotoUrl, setFotoUrl] = useState('');
    const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
    const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAusenciaDTO[]>([]);
    const [professoresMap, setProfessoresMap] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [diaDetalhes, setDiaDetalhes] = useState<EventoCalendario[] | null>(null);
    const [diaAtivo, setDiaAtivo] = useState<string | null>(null);
    const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

    const hoje = new Date();
    const [mes, setMes] = useState(hoje.getMonth());
    const [ano, setAno] = useState(hoje.getFullYear());

    useEffect(() => {
        const email = localStorage.getItem('userEmail') || '';
        if (email) {
            const fotoSalva = localStorage.getItem(`profilePhoto_${email}`);
            if (fotoSalva) setFotoUrl(fotoSalva);
            axios.get(`http://localhost:8080/coordenador?email=${email}`)
                .then(res => setCoordenador(res.data))
                .catch(() => {});
        }

        Promise.all([
            axios.get('http://localhost:8080/solicitacao/todas'),
            axios.get('http://localhost:8080/professor/todos'),
        ]).then(([resSol, resProf]) => {
            setSolicitacoes(Array.isArray(resSol.data) ? resSol.data : []);
            const mapa: Record<number, string> = {};
            (Array.isArray(resProf.data) ? resProf.data : []).forEach((p: any) => {
                mapa[p.id] = p.nome;
            });
            setProfessoresMap(mapa);
        }).catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const primeiroNome = coordenador?.nome?.split(' ')[0] || 'Coordenador';

    const solicitacoesFiltradas = filtroStatus === 'TODOS'
        ? solicitacoes
        : solicitacoes.filter(s => s.status === filtroStatus);

    const eventosPorData: Record<string, EventoCalendario[]> = {};
    solicitacoesFiltradas.forEach(s => {
        const data = s.dataAusencia;
        if (!eventosPorData[data]) eventosPorData[data] = [];
        eventosPorData[data].push({
            data,
            motivo: s.motivo,
            status: s.status,
            aulaNome: s.aula.nomeDisciplina || `#${s.aula.id}`,
            professorNome: s.professor.nome || `#${s.professor.id}`,
        });
    });

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();

    const handleDiaClick = (dia: number) => {
        const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        if (eventosPorData[dataStr]) {
            setDiaAtivo(dataStr);
            setDiaDetalhes(eventosPorData[dataStr]);
        }
    };

    const mesAnterior = () => {
        if (mes === 0) { setMes(11); setAno(a => a - 1); }
        else setMes(m => m - 1);
        setDiaAtivo(null); setDiaDetalhes(null);
    };

    const proximoMes = () => {
        if (mes === 11) { setMes(0); setAno(a => a + 1); }
        else setMes(m => m + 1);
        setDiaAtivo(null); setDiaDetalhes(null);
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
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
                    <button className="user-profile-btn" onClick={() => setModalPerfilAberto(true)}>
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

            {/* Conteúdo */}
            <main className="main-content">
                <header className="top-header">
                    <div className="header-title">
                        <h1>Calendário de Ausências</h1>
                        <p>Veja todos os dias em que professores solicitaram ausência.</p>
                    </div>
                    {/* Filtro de status */}
                    <div className="filtro-status">
                        {['TODOS','PENDENTE','APROVADO','RECUSADO','RESOLVIDA'].map(s => (
                            <button
                                key={s}
                                className={`filtro-btn ${filtroStatus === s ? 'filtro-ativo' : ''}`}
                                onClick={() => { setFiltroStatus(s); setDiaAtivo(null); setDiaDetalhes(null); }}
                                style={filtroStatus === s && s !== 'TODOS' ? { backgroundColor: statusCor[s], color: '#fff', borderColor: statusCor[s] } : {}}
                            >
                                {s.charAt(0) + s.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Cards */}
                <section className="summary-cards">
                    {(['PENDENTE','APROVADO','RECUSADO','RESOLVIDA'] as const).map(status => (
                        <div className="card" key={status}>
                            <div className="card-icon" style={{ backgroundColor: statusCor[status] + '22', color: statusCor[status], width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <CalendarDays size={24} />
                            </div>
                            <div className="card-info">
                                <span className="label">{status.charAt(0) + status.slice(1).toLowerCase()}</span>
                                <span className="value">{solicitacoes.filter(s => s.status === status).length}</span>
                                <span className="desc">Solicitações</span>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="cal-layout">
                    {/* Calendário */}
                    <section className="panel cal-panel">
                        <div className="cal-nav">
                            <button className="cal-nav-btn" onClick={mesAnterior}><ChevronLeft size={18} /></button>
                            <span className="cal-titulo">{MESES[mes]} {ano}</span>
                            <button className="cal-nav-btn" onClick={proximoMes}><ChevronRight size={18} /></button>
                        </div>

                        <div className="cal-grid">
                            {DIAS_SEMANA.map(d => (
                                <div className="cal-header-dia" key={d}>{d}</div>
                            ))}
                            {Array.from({ length: primeiroDia }).map((_, i) => (
                                <div key={`vazio-${i}`} className="cal-dia cal-dia-vazio" />
                            ))}
                            {Array.from({ length: diasNoMes }).map((_, i) => {
                                const dia = i + 1;
                                const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                                const eventos = eventosPorData[dataStr];
                                const isHoje = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
                                const isAtivo = diaAtivo === dataStr;

                                return (
                                    <div
                                        key={dia}
                                        className={`cal-dia ${eventos ? 'cal-dia-evento' : ''} ${isHoje ? 'cal-dia-hoje' : ''} ${isAtivo ? 'cal-dia-ativo' : ''}`}
                                        onClick={() => handleDiaClick(dia)}
                                    >
                                        <span className="cal-dia-num">{dia}</span>
                                        {eventos && (
                                            <div className="cal-pontos">
                                                {eventos.slice(0, 3).map((ev, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="cal-ponto"
                                                        style={{ backgroundColor: statusCor[ev.status] || '#3b82f6' }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cal-legenda">
                            {Object.entries(statusCor).map(([status, cor]) => (
                                <div className="legenda-item" key={status}>
                                    <span className="legenda-ponto" style={{ backgroundColor: cor }} />
                                    <span>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Detalhes */}
                    <section className="panel cal-detalhes">
                        <h3 className="detalhes-titulo">
                            {diaAtivo
                                ? `Ausências em ${diaAtivo.split('-').reverse().join('/')}`
                                : 'Selecione um dia'
                            }
                        </h3>
                        {!diaDetalhes && (
                            <p className="detalhes-vazio">Clique em um dia destacado para ver os detalhes.</p>
                        )}
                        {diaDetalhes && diaDetalhes.map((ev, i) => (
                            <div className="detalhe-card" key={i}>
                                <div className="detalhe-status-bar" style={{ backgroundColor: statusCor[ev.status] }} />
                                <div className="detalhe-body">
                                    <span className="detalhe-label">Professor</span>
                                    <span className="detalhe-valor">{ev.professorNome}</span>
                                    <span className="detalhe-label" style={{ marginTop: 8 }}>Motivo</span>
                                    <span className="detalhe-valor">{ev.motivo}</span>
                                    <span className="detalhe-label" style={{ marginTop: 8 }}>Aula</span>
                                    <span className="detalhe-valor">{ev.aulaNome}</span>
                                    <span className="detalhe-label" style={{ marginTop: 8 }}>Status</span>
                                    <span className="detalhe-badge" style={{ backgroundColor: statusCor[ev.status] + '22', color: statusCor[ev.status] }}>
                                        {ev.status}
                                    </span>
                                </div>
                            </div>
                        ))}

                        <div className="detalhes-mes">
                            <h4>Ausências em {MESES[mes]}</h4>
                            {loading && <p style={{ color: '#94a3b8', fontSize: 13 }}>Carregando...</p>}
                            {!loading && solicitacoesFiltradas.filter(s => {
                                const [a, m] = s.dataAusencia.split('-');
                                return parseInt(a) === ano && parseInt(m) === mes + 1;
                            }).length === 0 && (
                                <p className="detalhes-vazio">Nenhuma ausência neste mês.</p>
                            )}
                            {solicitacoesFiltradas
                                .filter(s => {
                                    const [a, m] = s.dataAusencia.split('-');
                                    return parseInt(a) === ano && parseInt(m) === mes + 1;
                                })
                                .sort((a, b) => a.dataAusencia.localeCompare(b.dataAusencia))
                                .map((s, i) => (
                                    <div className="mes-item" key={i}>
                                        <span className="mes-data">{s.dataAusencia.split('-').reverse().join('/')}</span>
                                        <span className="mes-motivo">{s.professor.nome || `Prof #${s.professor.id}`}</span>
                                        <span className="mes-badge" style={{ backgroundColor: statusCor[s.status] + '22', color: statusCor[s.status] }}>
                                            {s.status}
                                        </span>
                                    </div>
                                ))
                            }
                        </div>
                    </section>
                </div>
            </main>

            {modalPerfilAberto && (
                <ModalPerfil
                    coordenador={coordenador}
                    fotoUrl={fotoUrl}
                    onClose={() => setModalPerfilAberto(false)}
                    onSalvar={novoNome => setCoordenador(prev => prev ? { ...prev, nome: novoNome } : prev)}
                    onFotoChange={setFotoUrl}
                />
            )}
        </div>
    );
};

export default CalendarioCoordenador;