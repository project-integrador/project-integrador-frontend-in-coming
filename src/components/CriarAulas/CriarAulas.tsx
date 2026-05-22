import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    BookOpen, ShieldCheck, Users, LayoutDashboard, RefreshCw,
    LogOut, User, ArrowLeft, Settings, X, Save, Camera, CalendarDays
} from 'lucide-react';
import { ProfessorDTO } from '../../dtos/ProfessorDTO';
import { AulaDTO } from '../../dtos/AulaDTO';
import { CoordenadorDTO } from '../../dtos/CoordenadorDTO';
import './CriarAulas.css';

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
                        <button type="submit" className="btn-salvar-modal" disabled={loading}><Save size={14} />{loading ? 'Salvando...' : 'Salvar Alterações'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CriarAulas: React.FC = () => {
    const navigate = useNavigate();
    const [professores, setProfessores] = useState<ProfessorDTO[]>([]);
    const [aulas, setAulas] = useState<AulaDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingDados, setLoadingDados] = useState(true);
    const [coordenador, setCoordenador] = useState<CoordenadorDTO | null>(null);
    const [fotoUrl, setFotoUrl] = useState('');
    const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
    const primeiroNome = coordenador?.nome?.split(' ')[0] || 'Coordenador';
    const [nomeDisciplina, setNomeDisciplina] = useState('');
    const [cargaHoraria, setCargaHoraria] = useState('');
    const [professorId, setProfessorId] = useState('');
    const [aulaEditando, setAulaEditando] = useState<AulaDTO | null>(null);
    const [editNome, setEditNome] = useState('');
    const [editCarga, setEditCarga] = useState('');
    const [editProfessorId, setEditProfessorId] = useState('');

    useEffect(() => {
        const email = localStorage.getItem('userEmail') || '';
        if (email) {
            const fotoSalva = localStorage.getItem(`profilePhoto_${email}`);
            if (fotoSalva) setFotoUrl(fotoSalva);
            axios.get(`http://localhost:8080/coordenador?email=${email}`).then(res => setCoordenador(res.data)).catch(() => {});
        }
        const fetchDados = async () => {
            try {
                const [resP, resA] = await Promise.all([
                    axios.get('http://localhost:8080/professor/todos'),
                    axios.get('http://localhost:8080/aula'),
                ]);
                setProfessores(Array.isArray(resP.data) ? resP.data : []);
                setAulas(Array.isArray(resA.data) ? resA.data : []);
            } catch {
                alert('Erro ao carregar dados.');
            } finally {
                setLoadingDados(false);
            }
        };
        fetchDados();
    }, []);

    const handleCriar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!professorId) { alert('Selecione um professor.'); return; }
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:8080/aula', { nomeDisciplina, cargaHoraria: parseInt(cargaHoraria), professorTitular: { id: parseInt(professorId) } });
            setAulas(prev => [...prev, res.data]);
            setNomeDisciplina(''); setCargaHoraria(''); setProfessorId('');
            alert('Aula criada com sucesso!');
        } catch {
            alert('Erro ao criar aula.');
        } finally {
            setLoading(false);
        }
    };

    const abrirEdicao = (aula: AulaDTO) => {
        setAulaEditando(aula); setEditNome(aula.nomeDisciplina);
        setEditCarga(String(aula.cargaHoraria)); setEditProfessorId(String(aula.professorTitular?.id || ''));
    };

    const handleAtualizar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aulaEditando?.id) return;
        setLoading(true);
        try {
            const res = await axios.put(`http://localhost:8080/aula/${aulaEditando.id}`, { nomeDisciplina: editNome, cargaHoraria: parseInt(editCarga), professorTitular: { id: parseInt(editProfessorId) } });
            setAulas(prev => prev.map(a => a.id === aulaEditando.id ? res.data : a));
            setAulaEditando(null);
            alert('Aula atualizada com sucesso!');
        } catch {
            alert('Erro ao atualizar aula.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-icon-small"><ShieldCheck color="#fff" size={24} /></div>
                    <h2>S-<span>RAF</span></h2>
                </div>
                <nav className="sidebar-nav">
                    <button className="nav-item" onClick={() => navigate('/dashboard-coordenador')}><LayoutDashboard size={20} /><span>Solicitações</span></button>
                    <button className="nav-item" onClick={() => navigate('/coordenador-substituicoes')}><RefreshCw size={20} /><span>Substituições</span></button>
                    <button className="nav-item active" onClick={() => navigate('/coordenador-aulas')}><BookOpen size={20} /><span>Aulas</span></button>
                    <button className="nav-item" onClick={() => navigate('/coordenador-usuarios')}><Users size={20} /><span>Todos os Usuários</span></button>
                    <button className="nav-item" onClick={() => navigate('/coordenador-calendario')}><CalendarDays size={20} /><span>Calendário</span></button>
                </nav>
                <div className="sidebar-footer">
                    <button className="nav-item text-danger" onClick={() => { localStorage.clear(); navigate('/'); }}><LogOut size={20} /><span>Sair</span></button>
                    <button className="user-profile-btn" onClick={() => setModalPerfilAberto(true)}>
                        <div className="avatar-mini">{fotoUrl ? <img src={fotoUrl} alt="Perfil" className="avatar-img" /> : <User size={20} color="#64748b" />}</div>
                        <div className="user-info"><span className="user-name">{primeiroNome}</span><span className="user-role">Administrador</span></div>
                        <Settings size={14} className="perfil-settings-icon" />
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-header">
                    <div className="header-title">
                        <button className="btn-voltar" onClick={() => navigate('/coordenador-aulas')}><ArrowLeft size={16} /> Voltar para Aulas</button>
                        <h1>Gerenciar Aulas</h1>
                        <p>Crie novas aulas ou edite as existentes.</p>
                    </div>
                    <div className="header-actions"><div className="avatar-top"><User size={20} color="#fff" /></div></div>
                </header>
                <section className="panel" style={{ marginBottom: '28px' }}>
                    <div className="panel-header"><h3>Nova Aula</h3></div>
                    <form onSubmit={handleCriar} className="form-criar">
                        <div className="form-row-criar">
                            <div className="form-group-criar"><label>Disciplina</label><input type="text" placeholder="Ex: Redes" value={nomeDisciplina} onChange={e => setNomeDisciplina(e.target.value)} required /></div>
                            <div className="form-group-criar"><label>Carga Horária (h)</label><input type="number" placeholder="Ex: 40" value={cargaHoraria} onChange={e => setCargaHoraria(e.target.value)} required min={1} /></div>
                            <div className="form-group-criar">
                                <label>Professor Titular</label>
                                <select value={professorId} onChange={e => setProfessorId(e.target.value)} required>
                                    <option value="" disabled>Selecione um professor</option>
                                    {professores.map(p => <option key={p.id} value={p.id}>{p.nome} — {p.email}</option>)}
                                </select>
                            </div>
                            <div className="form-group-criar" style={{ justifyContent: 'flex-end' }}>
                                <label>&nbsp;</label>
                                <button type="submit" className="btn-criar" disabled={loading}>{loading ? 'Criando...' : '+ Criar Aula'}</button>
                            </div>
                        </div>
                    </form>
                </section>
                <section className="panel">
                    <div className="panel-header"><h3>Aulas Cadastradas ({aulas.length})</h3></div>
                    {loadingDados ? <p className="loading-text">Carregando...</p> : (
                        <table className="schedule-table">
                            <thead><tr><th>ID</th><th>Disciplina</th><th>Carga Horária</th><th>Professor Titular</th><th>Ações</th></tr></thead>
                            <tbody>
                            {aulas.length > 0 ? aulas.map(a => (
                                <tr key={a.id}>
                                    <td>#{a.id}</td><td>{a.nomeDisciplina}</td>
                                    <td><span className="badge-horas">{a.cargaHoraria}h</span></td>
                                    <td>{a.professorTitular?.nome || '—'}</td>
                                    <td><button className="btn-editar" onClick={() => abrirEdicao(a)}>Editar</button></td>
                                </tr>
                            )) : <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Nenhuma aula cadastrada.</td></tr>}
                            </tbody>
                        </table>
                    )}
                </section>
            </main>

            {aulaEditando && (
                <div className="modal-overlay" onClick={() => setAulaEditando(null)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>Editar Aula #{aulaEditando.id}</h3>
                        <p className="modal-sub">{aulaEditando.nomeDisciplina}</p>
                        <form onSubmit={handleAtualizar}>
                            <div className="form-group-modal"><label>Nome da Disciplina</label><input type="text" value={editNome} onChange={e => setEditNome(e.target.value)} required /></div>
                            <div className="form-group-modal"><label>Carga Horária (h)</label><input type="number" value={editCarga} onChange={e => setEditCarga(e.target.value)} required min={1} /></div>
                            <div className="form-group-modal">
                                <label>Professor Titular</label>
                                <select value={editProfessorId} onChange={e => setEditProfessorId(e.target.value)} required>
                                    <option value="" disabled>Selecione um professor</option>
                                    {professores.map(p => <option key={p.id} value={p.id}>{p.nome} — {p.email}</option>)}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar-modal" onClick={() => setAulaEditando(null)}>Cancelar</button>
                                <button type="submit" className="btn-salvar-modal" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Alterações'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {modalPerfilAberto && (
                <ModalPerfil coordenador={coordenador} fotoUrl={fotoUrl} onClose={() => setModalPerfilAberto(false)}
                             onSalvar={(novoNome) => setCoordenador(prev => prev ? { ...prev, nome: novoNome } : prev)} onFotoChange={setFotoUrl} />
            )}
        </div>
    );
};

export default CriarAulas;