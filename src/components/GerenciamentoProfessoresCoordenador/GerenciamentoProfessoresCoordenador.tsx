import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ShieldCheck, Users, LayoutDashboard, RefreshCw, BookOpen,
    LogOut, User, ArrowLeft, Trash2, Plus, Settings, X, Save, Camera, CalendarDays
} from 'lucide-react';
import { ProfessorDTO } from '../../dtos/ProfessorDTO';
import { CoordenadorDTO } from '../../dtos/CoordenadorDTO';
import './GerenciamentoProfessoresCoordenador.css';

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

const GerenciamentoProfessoresCoordenador: React.FC = () => {
    const navigate = useNavigate();
    const [professores, setProfessores] = useState<ProfessorDTO[]>([]);
    const [loadingDados, setLoadingDados] = useState(true);
    const [loading, setLoading] = useState(false);
    const [busca, setBusca] = useState('');
    const [coordenador, setCoordenador] = useState<CoordenadorDTO | null>(null);
    const [fotoUrl, setFotoUrl] = useState('');
    const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [profSelecionado, setProfSelecionado] = useState<ProfessorDTO | null>(null);
    const [form, setForm] = useState<ProfessorDTO>({ nome: '', email: '', password: '', matricula: '', telefone: '', areaAtuacao: '', ativo: true });
    const [profExcluindo, setProfExcluindo] = useState<ProfessorDTO | null>(null);
    const primeiroNome = coordenador?.nome?.split(' ')[0] || 'Coordenador';

    useEffect(() => {
        const email = localStorage.getItem('userEmail') || '';
        if (email) {
            const fotoSalva = localStorage.getItem(`profilePhoto_${email}`);
            if (fotoSalva) setFotoUrl(fotoSalva);
            axios.get(`http://localhost:8080/coordenador?email=${email}`).then(res => setCoordenador(res.data)).catch(() => {});
        }
        carregarProfessores();
    }, []);

    const carregarProfessores = async () => {
        try {
            const res = await axios.get('http://localhost:8080/professor/todos');
            setProfessores(Array.isArray(res.data) ? res.data : []);
        } catch {
            alert('Erro ao carregar professores.');
        } finally {
            setLoadingDados(false);
        }
    };

    const abrirCriar = () => {
        setModoEdicao(false);
        setProfSelecionado(null);
        setForm({ nome: '', email: '', password: '', matricula: '', telefone: '', areaAtuacao: '', ativo: true });
        setModalAberto(true);
    };

    const abrirEdicao = (prof: ProfessorDTO) => {
        setModoEdicao(true);
        setProfSelecionado(prof);
        setForm({ ...prof, password: '' });
        setModalAberto(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: name === 'ativo' ? value === 'true' : value }));
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (modoEdicao && profSelecionado?.id) {
                const payload = form.password ? form : { ...form, password: undefined };
                const res = await axios.put(`http://localhost:8080/professor/${profSelecionado.id}`, payload);
                setProfessores(prev => prev.map(p => p.id === profSelecionado.id ? res.data : p));
                alert('Professor atualizado com sucesso!');
            } else {
                const res = await axios.post('http://localhost:8080/professor', form);
                setProfessores(prev => [...prev, res.data]);
                alert('Professor criado com sucesso!');
            }
            setModalAberto(false);
        } catch {
            alert('Erro ao salvar professor.');
        } finally {
            setLoading(false);
        }
    };

    const handleExcluir = async () => {
        if (!profExcluindo?.email) return;
        setLoading(true);
        try {
            await axios.delete(`http://localhost:8080/professor?email=${profExcluindo.email}`);
            setProfessores(prev => prev.filter(p => p.email !== profExcluindo.email));
            setProfExcluindo(null);
            alert('Professor excluído com sucesso!');
        } catch {
            alert('Erro ao excluir professor.');
        } finally {
            setLoading(false);
        }
    };

    const professoresFiltrados = professores.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.email.toLowerCase().includes(busca.toLowerCase()) ||
        p.matricula.toLowerCase().includes(busca.toLowerCase())
    );

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
                    <button className="nav-item" onClick={() => navigate('/coordenador-aulas')}><BookOpen size={20} /><span>Aulas</span></button>
                    <button className="nav-item active" onClick={() => navigate('/coordenador-usuarios')}><Users size={20} /><span>Todos os Usuários</span></button>
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
                        <button className="btn-voltar" onClick={() => navigate('/coordenador-usuarios')}><ArrowLeft size={16} /> Voltar para Usuários</button>
                        <h1>Gerenciar Professores</h1>
                        <p>Adicione, edite ou remova professores do sistema.</p>
                    </div>
                    <div className="header-actions"><div className="avatar-top"><User size={20} color="#fff" /></div></div>
                </header>
                <section className="summary-cards">
                    <div className="card"><div className="card-icon blue"><Users size={24} /></div><div className="card-info"><span className="label">Total</span><span className="value">{professores.length}</span><span className="desc">Professores cadastrados</span></div></div>
                    <div className="card"><div className="card-icon green"><User size={24} /></div><div className="card-info"><span className="label">Ativos</span><span className="value">{professores.filter(p => p.ativo).length}</span><span className="desc">Em atividade</span></div></div>
                    <div className="card"><div className="card-icon red"><User size={24} /></div><div className="card-info"><span className="label">Inativos</span><span className="value">{professores.filter(p => !p.ativo).length}</span><span className="desc">Fora de atividade</span></div></div>
                </section>
                <section className="panel">
                    <div className="panel-header">
                        <h3>Lista de Professores ({professoresFiltrados.length})</h3>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <input className="input-busca" type="text" placeholder="Buscar por nome, e-mail ou matrícula..." value={busca} onChange={e => setBusca(e.target.value)} />
                            <button className="btn-adicionar" onClick={abrirCriar}><Plus size={15} /> Adicionar Professor</button>
                        </div>
                    </div>
                    {loadingDados ? <p className="loading-text">Carregando...</p> : (
                        <table className="schedule-table">
                            <thead><tr><th>ID</th><th>Nome</th><th>E-mail</th><th>Matrícula</th><th>Telefone</th><th>Área</th><th>Status</th><th>Ações</th></tr></thead>
                            <tbody>
                            {professoresFiltrados.length > 0 ? professoresFiltrados.map(p => (
                                <tr key={p.id}>
                                    <td>#{p.id}</td><td>{p.nome}</td><td>{p.email}</td><td>{p.matricula}</td>
                                    <td>{p.telefone || '—'}</td><td>{p.areaAtuacao || '—'}</td>
                                    <td><span className={p.ativo ? 'badge-ativo' : 'badge-inativo'}>{p.ativo ? 'Ativo' : 'Inativo'}</span></td>
                                    <td><div className="acoes-cell"><button className="btn-editar" onClick={() => abrirEdicao(p)}>Editar</button><button className="btn-excluir" onClick={() => setProfExcluindo(p)}><Trash2 size={14} /></button></div></td>
                                </tr>
                            )) : <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>{busca ? 'Nenhum professor encontrado.' : 'Nenhum professor cadastrado.'}</td></tr>}
                            </tbody>
                        </table>
                    )}
                </section>
            </main>

            {modalAberto && (
                <div className="modal-overlay" onClick={() => setModalAberto(false)}>
                    <div className="modal-box modal-largo" onClick={e => e.stopPropagation()}>
                        <h3>{modoEdicao ? `Editar Professor #${profSelecionado?.id}` : 'Adicionar Professor'}</h3>
                        <p className="modal-sub">{modoEdicao ? 'Altere os dados do professor abaixo.' : 'Preencha os dados para cadastrar um novo professor.'}</p>
                        <form onSubmit={handleSalvar}>
                            <div className="form-grid-modal">
                                <div className="form-group-modal"><label>Nome</label><input name="nome" value={form.nome} onChange={handleFormChange} placeholder="Nome completo" required /></div>
                                <div className="form-group-modal"><label>E-mail</label><input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="email@exemplo.com" required /></div>
                                <div className="form-group-modal"><label>{modoEdicao ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}</label><input name="password" type="password" value={form.password} onChange={handleFormChange} placeholder="••••••••" required={!modoEdicao} /></div>
                                <div className="form-group-modal"><label>Matrícula</label><input name="matricula" value={form.matricula} onChange={handleFormChange} placeholder="Ex: MAT001" required /></div>
                                <div className="form-group-modal"><label>Telefone</label><input name="telefone" value={form.telefone} onChange={handleFormChange} placeholder="(00) 00000-0000" /></div>
                                <div className="form-group-modal"><label>Área de Atuação</label><input name="areaAtuacao" value={form.areaAtuacao} onChange={handleFormChange} placeholder="Ex: Matemática" /></div>
                                <div className="form-group-modal"><label>Status</label><select name="ativo" value={String(form.ativo)} onChange={handleFormChange}><option value="true">Ativo</option><option value="false">Inativo</option></select></div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar-modal" onClick={() => setModalAberto(false)}>Cancelar</button>
                                <button type="submit" className="btn-salvar-modal" disabled={loading}>{loading ? 'Salvando...' : modoEdicao ? 'Salvar Alterações' : 'Cadastrar Professor'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {profExcluindo && (
                <div className="modal-overlay" onClick={() => setProfExcluindo(null)}>
                    <div className="modal-box modal-box-sm" onClick={e => e.stopPropagation()}>
                        <h3>Excluir Professor</h3>
                        <p className="modal-sub">Tem certeza que deseja excluir <strong>{profExcluindo.nome}</strong>? Esta ação não pode ser desfeita.</p>
                        <div className="modal-actions">
                            <button className="btn-cancelar-modal" onClick={() => setProfExcluindo(null)}>Cancelar</button>
                            <button className="btn-excluir-modal" disabled={loading} onClick={handleExcluir}>{loading ? 'Excluindo...' : 'Sim, Excluir'}</button>
                        </div>
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

export default GerenciamentoProfessoresCoordenador;