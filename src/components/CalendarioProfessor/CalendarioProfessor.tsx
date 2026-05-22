import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard, FilePlus, ClipboardList,
    LogOut, User, Settings, X, Save, Camera,
    CalendarDays, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ProfessorDTO } from '../../dtos/ProfessorDTO';
import { SolicitacaoAusenciaDTO } from '../../dtos/SolicitacaoAusenciaDTO';
import './CalendarioProfessor.css';

// ─── Modal de Perfil ──────────────────────────────────────────────────────────

interface ModalPerfilProps {
    professor: ProfessorDTO | null;
    fotoUrl: string;
    onClose: () => void;
    onSalvar: (novoNome: string) => void;
    onFotoChange: (base64: string) => void;
}

const ModalPerfil: React.FC<ModalPerfilProps> = ({ professor, fotoUrl, onClose, onSalvar, onFotoChange }) => {
    const [nome, setNome] = useState(professor?.nome || '');
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
        if (!nome.trim() || !professor?.id) return;
        setLoading(true);
        try {
            await axios.put(`http://localhost:8080/professor/${professor.id}`, {
                ...professor,
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
                    <span className="perfil-email-value">{professor?.email || '—'}</span>
                    <span className="perfil-email-label" style={{ marginTop: 8 }}>Matrícula</span>
                    <span className="perfil-email-value">{professor?.matricula || '—'}</span>
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

// ─── Calendário ───────────────────────────────────────────────────────────────

const MESES = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

// Interface
interface EventoCalendario {
    data: string; // "YYYY-MM-DD"
    motivo: string;
    status: string;
    aulaNome: string; // 👈 era: aulaId: number
}


const statusCor: Record<string, string> = {
    PENDENTE: '#f59e0b',
    APROVADO: '#22c55e',
    RECUSADO: '#f43f5e',
    RESOLVIDA: '#8b5cf6',
};

const CalendarioProfessor: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const [professor, setProfessor] = useState<ProfessorDTO | null>(null);
    const [fotoUrl, setFotoUrl] = useState('');
    const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
    const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAusenciaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [diaDetalhes, setDiaDetalhes] = useState<EventoCalendario[] | null>(null);
    const [diaAtivo, setDiaAtivo] = useState<string | null>(null);

    const hoje = new Date();
    const [mes, setMes] = useState(hoje.getMonth());
    const [ano, setAno] = useState(hoje.getFullYear());

    useEffect(() => {
        const email = localStorage.getItem('userEmail') || '';
        if (!email) return;
        const fotoSalva = localStorage.getItem(`profilePhoto_${email}`);
        if (fotoSalva) setFotoUrl(fotoSalva);

        axios.get(`http://localhost:8080/professor?email=${email}`)
            .then(res => {
                setProfessor(res.data);
                const profId = res.data.id;
                return axios.get('http://localhost:8080/solicitacao/todas');
            })
            .then(res => {
                const todas = Array.isArray(res.data) ? res.data : [];
                const email2 = localStorage.getItem('userEmail') || '';
                // Filtra só as do professor logado (via id)
                setSolicitacoes(todas);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // Filtra solicitações do professor logado
    useEffect(() => {
        if (!professor?.id) return;
        axios.get('http://localhost:8080/solicitacao/todas')
            .then(res => {
                const todas = Array.isArray(res.data) ? res.data : [];
                const minhas = todas.filter((s: SolicitacaoAusenciaDTO) => s.professor.id === professor.id);
                setSolicitacoes(minhas);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [professor]);

    const primeiroNome = professor?.nome?.split(' ')[0] || 'Prof';

    // Mapa de datas com eventos
    const eventosPorData: Record<string, EventoCalendario[]> = {};
    solicitacoes.forEach(s => {
        const data = s.dataAusencia; // "YYYY-MM-DD"
        if (!eventosPorData[data]) eventosPorData[data] = [];
// eventosPorData (dentro do forEach)
        eventosPorData[data].push({
            data,
            motivo: s.motivo,
            status: s.status,
            aulaNome: s.aula.nomeDisciplina || `#${s.aula.id}`, // 👈 era: aulaId: s.aula.id
        });
    });

    // Dias do mês
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
    };

    const proximoMes = () => {
        if (mes === 11) { setMes(0); setAno(a => a + 1); }
        else setMes(m => m + 1);
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-icon-small"><User color="#fff" size={24} /></div>
                    <h2>S-<span>RAF</span></h2>
                </div>
                <nav className="sidebar-nav">
                    <button className={`nav-item ${isActive('/dashboard-professor') ? 'active' : ''}`} onClick={() => navigate('/dashboard-professor')}>
                        <LayoutDashboard size={20} /><span>Dashboard</span>
                    </button>
                    <button className={`nav-item ${isActive('/calendario-professor') ? 'active' : ''}`} onClick={() => navigate('/calendario-professor')}>
                        <CalendarDays size={20} /><span>Calendário</span>
                    </button>
                    <button className={`nav-item ${isActive('/solicitar-substituicao') ? 'active' : ''}`} onClick={() => navigate('/solicitar-substituicao')}>
                        <FilePlus size={20} /><span>Solicitar Substituição</span>
                    </button>
                    <button className={`nav-item ${isActive('/minhas-solicitacoes') ? 'active' : ''}`} onClick={() => navigate('/minhas-solicitacoes')}>
                        <ClipboardList size={20} /><span>Minhas Solicitações</span>
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
                            <span className="user-role">Docente</span>
                        </div>
                        <Settings size={14} className="perfil-settings-icon" />
                    </button>
                </div>
            </aside>

            {/* Conteúdo */}
            <main className="main-content">
                <header className="top-header">
                    <div className="header-title">
                        <h1>Meu Calendário</h1>
                        <p>Veja os dias em que você solicitou ausência.</p>
                    </div>
                </header>

                {/* Cards resumo */}
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

                        {/* Legenda */}
                        <div className="cal-legenda">
                            {Object.entries(statusCor).map(([status, cor]) => (
                                <div className="legenda-item" key={status}>
                                    <span className="legenda-ponto" style={{ backgroundColor: cor }} />
                                    <span>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Detalhes do dia */}
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
                                    <span className="detalhe-label">Motivo</span>
                                    <span className="detalhe-valor">{ev.motivo}</span>
                                    <span className="detalhe-label">Aula</span>
                                    <span className="detalhe-valor">{ev.aulaNome}</span> {/* 👈 era: #{ev.aulaId} */}
                                    <span className="detalhe-label" style={{ marginTop: 8 }}>Status</span>
                                    <span className="detalhe-badge" style={{ backgroundColor: statusCor[ev.status] + '22', color: statusCor[ev.status] }}>
                                        {ev.status}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Lista do mês */}
                        <div className="detalhes-mes">
                            <h4>Ausências em {MESES[mes]}</h4>
                            {loading && <p style={{ color: '#94a3b8', fontSize: 13 }}>Carregando...</p>}
                            {!loading && solicitacoes.filter(s => {
                                const [a, m] = s.dataAusencia.split('-');
                                return parseInt(a) === ano && parseInt(m) === mes + 1;
                            }).length === 0 && (
                                <p className="detalhes-vazio">Nenhuma ausência neste mês.</p>
                            )}
                            {solicitacoes
                                .filter(s => {
                                    const [a, m] = s.dataAusencia.split('-');
                                    return parseInt(a) === ano && parseInt(m) === mes + 1;
                                })
                                .sort((a, b) => a.dataAusencia.localeCompare(b.dataAusencia))
                                .map((s, i) => (
                                    <div className="mes-item" key={i}>
                                        <span className="mes-data">{s.dataAusencia.split('-').reverse().join('/')}</span>
                                        <span className="mes-motivo">{s.motivo}</span>
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
                    professor={professor}
                    fotoUrl={fotoUrl}
                    onClose={() => setModalPerfilAberto(false)}
                    onSalvar={novoNome => setProfessor(prev => prev ? { ...prev, nome: novoNome } : prev)}
                    onFotoChange={setFotoUrl}
                />
            )}
        </div>
    );
};

export default CalendarioProfessor;