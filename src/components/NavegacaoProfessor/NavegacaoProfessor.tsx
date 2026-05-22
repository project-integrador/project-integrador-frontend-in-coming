import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FilePlus, LogOut, User, ClipboardList, Settings, X, Save, Camera, CalendarDays } from 'lucide-react';
import './NavegacaoProfessor.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ProfessorDTO } from '../../dtos/ProfessorDTO';

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
                    <span className="perfil-label">E-mail</span>
                    <span className="perfil-value">{professor?.email || '—'}</span>
                    <span className="perfil-label" style={{ marginTop: 8 }}>Matrícula</span>
                    <span className="perfil-value">{professor?.matricula || '—'}</span>
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
                        <button type="button" className="btn-cancelar-modal" onClick={onClose}>
                            Cancelar
                        </button>
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

const NavegacaoProfessor: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const [professor, setProfessor] = useState<ProfessorDTO | null>(null);
    const [fotoUrl, setFotoUrl] = useState('');
    const [modalAberto, setModalAberto] = useState(false);

    useEffect(() => {
        const email = localStorage.getItem('userEmail') || '';
        if (email) {
            const fotoSalva = localStorage.getItem(`profilePhoto_${email}`);
            if (fotoSalva) setFotoUrl(fotoSalva);

            axios.get(`http://localhost:8080/professor?email=${email}`)
                .then(res => setProfessor(res.data))
                .catch(() => {});
        }
    }, []);

    const primeiroNome = professor?.nome?.split(' ')[0] || 'Prof';

    const handleSalvarNome = (novoNome: string) => {
        setProfessor(prev => prev ? { ...prev, nome: novoNome } : prev);
    };

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-icon-small">
                        <User color="#fff" size={24} />
                    </div>
                    <h2>S-<span>RAF</span></h2>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${isActive('/dashboard-professor') ? 'active' : ''}`}
                        onClick={() => navigate('/dashboard-professor')}
                    >
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </button>

                    <button
                        className={`nav-item ${isActive('/calendario-professor') ? 'active' : ''}`}
                        onClick={() => navigate('/calendario-professor')}
                    >
                        <CalendarDays size={20} />
                        <span>Calendário</span>
                    </button>

                    <button
                        className={`nav-item ${isActive('/solicitar-substituicao') ? 'active' : ''}`}
                        onClick={() => navigate('/solicitar-substituicao')}
                    >
                        <FilePlus size={20} />
                        <span>Solicitar Substituição</span>
                    </button>

                    <button
                        className={`nav-item ${isActive('/minhas-solicitacoes') ? 'active' : ''}`}
                        onClick={() => navigate('/minhas-solicitacoes')}
                    >
                        <ClipboardList size={20} />
                        <span>Minhas Solicitações</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="nav-item text-danger"
                        onClick={() => { localStorage.clear(); navigate('/'); }}
                    >
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>

                    <button className="user-profile-btn" onClick={() => setModalAberto(true)}>
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

            {modalAberto && (
                <ModalPerfil
                    professor={professor}
                    fotoUrl={fotoUrl}
                    onClose={() => setModalAberto(false)}
                    onSalvar={handleSalvarNome}
                    onFotoChange={setFotoUrl}
                />
            )}
        </>
    );
};

export default NavegacaoProfessor;