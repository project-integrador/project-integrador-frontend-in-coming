import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ShieldCheck, Users, LayoutDashboard, RefreshCw, BookOpen,
    LogOut, User, ArrowLeft, Trash2, Settings, X, Save, Camera, CalendarDays
} from 'lucide-react';
import { ProfessorDTO } from '../../dtos/ProfessorDTO';
import { CoordenadorDTO } from '../../dtos/CoordenadorDTO';
import { atualizarSubstituicao } from "../../fetch/SubstutuicaoRequests";
import './GerenciamentoSubstituicao.css';

interface ModalPerfilProps {
    coordenador: CoordenadorDTO | null;
    fotoUrl: string;
    onClose: () => void;
    onSalvar: (novoNome: string) => void;
    onFotoChange: (base64: string) => void;
}

const ModalPerfil: React.FC<ModalPerfilProps> = ({
                                                     coordenador,
                                                     fotoUrl,
                                                     onClose,
                                                     onSalvar,
                                                     onFotoChange
                                                 }) => {

    const [nome, setNome] = useState(coordenador?.nome || '');
    const [loading, setLoading] = useState(false);

    const handleFotoChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = e.target.files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {

            const base64 = reader.result as string;

            const email =
                localStorage.getItem('userEmail') || '';

            localStorage.setItem(
                `profilePhoto_${email}`,
                base64
            );

            onFotoChange(base64);
        };

        reader.readAsDataURL(file);
    };

    const handleSalvar = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (!nome.trim() || !coordenador?.id) return;

        setLoading(true);

        try {

            await axios.put(
                `http://localhost:8080/coordenador/${coordenador.id}`,
                {
                    ...coordenador,
                    nome: nome.trim()
                }
            );

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
        <div
            className="modal-overlay"
            onClick={onClose}
        >

            <div
                className="modal-box modal-perfil"
                onClick={e => e.stopPropagation()}
            >

                <div className="modal-perfil-header">
                    <h3>Configurações de Perfil</h3>

                    <button
                        className="btn-fechar-modal"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="perfil-avatar-grande">

                    <div className="avatar-grande-circulo">

                        {fotoUrl ? (

                            <img
                                src={fotoUrl}
                                alt="Perfil"
                                className="avatar-img-grande"
                            />

                        ) : (

                            <User
                                size={40}
                                color="#64748b"
                            />
                        )}
                    </div>

                    <label className="btn-trocar-foto">

                        <Camera size={13} />

                        Trocar foto

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFotoChange}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>

                <div className="perfil-info-static">

                    <span className="perfil-email-label">
                        E-mail
                    </span>

                    <span className="perfil-email-value">
                        {coordenador?.email || '—'}
                    </span>

                    <span
                        className="perfil-email-label"
                        style={{ marginTop: 8 }}
                    >
                        Matrícula
                    </span>

                    <span className="perfil-email-value">
                        {coordenador?.matricula || '—'}
                    </span>
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

                        <button
                            type="button"
                            className="btn-cancelar-modal"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="btn-salvar-modal"
                            disabled={loading}
                        >

                            <Save size={14} />

                            {loading
                                ? 'Salvando...'
                                : 'Salvar Alterações'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const GerenciamentoSubstituicao: React.FC = () => {

    const navigate = useNavigate();

    const [substituicoes, setSubstituicoes] =
        useState<any[]>([]);

    const [professores, setProfessores] =
        useState<ProfessorDTO[]>([]);

    const [loadingDados, setLoadingDados] =
        useState(true);

    const [loading, setLoading] =
        useState(false);

    const [coordenador, setCoordenador] =
        useState<CoordenadorDTO | null>(null);

    const [fotoUrl, setFotoUrl] =
        useState('');

    const [modalPerfilAberto, setModalPerfilAberto] =
        useState(false);

    const [subEditando, setSubEditando] =
        useState<any | null>(null);

    const [editProfessorId, setEditProfessorId] =
        useState('');

    const [subExcluindo, setSubExcluindo] =
        useState<any | null>(null);

    const primeiroNome =
        coordenador?.nome?.split(' ')[0]
        || 'Coordenador';

    useEffect(() => {

        const email =
            localStorage.getItem('userEmail') || '';

        if (email) {

            const fotoSalva =
                localStorage.getItem(
                    `profilePhoto_${email}`
                );

            if (fotoSalva) {

                setFotoUrl(fotoSalva);
            }

            axios
                .get(
                    `http://localhost:8080/coordenador?email=${email}`
                )
                .then(res => setCoordenador(res.data))
                .catch(() => {});
        }

        const fetchDados = async () => {

            try {

                const [resSub, resProf] =
                    await Promise.all([
                        axios.get(
                            'http://localhost:8080/substituicao'
                        ),
                        axios.get(
                            'http://localhost:8080/professor/todos'
                        ),
                    ]);

                setSubstituicoes(
                    Array.isArray(resSub.data)
                        ? resSub.data
                        : []
                );

                setProfessores(
                    Array.isArray(resProf.data)
                        ? resProf.data
                        : []
                );

            } catch {

                alert('Erro ao carregar dados.');

            } finally {

                setLoadingDados(false);
            }
        };

        fetchDados();

    }, []);

    const abrirEdicao = (sub: any) => {

        setSubEditando(sub);

        setEditProfessorId(
            String(
                sub.professorSubstituto?.id || ''
            )
        );
    };

    const handleAtualizar = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (!subEditando?.id) return;

        setLoading(true);

        try {

            const res =
                await atualizarSubstituicao(
                    subEditando.id,
                    {
                        coordenador: {
                            id: subEditando.coordenador.id
                        },

                        professorSubstituto: {
                            id: parseInt(editProfessorId)
                        },

                        solicitacaoAusencia: {
                            id: subEditando
                                .solicitacaoAusencia.id
                        }
                    }
                );

            setSubstituicoes(prev =>
                prev.map(s =>
                    s.id === subEditando.id
                        ? res.data
                        : s
                )
            );

            setSubEditando(null);

            alert(
                'Substituição atualizada com sucesso!'
            );

        } catch (error) {

            console.error(error);

            alert(
                'Erro ao atualizar substituição.'
            );

        } finally {

            setLoading(false);
        }
    };

    const handleExcluir = async () => {

        if (!subExcluindo?.id) return;

        setLoading(true);

        try {

            await axios.delete(
                `http://localhost:8080/substituicao/${subExcluindo.id}`
            );

            setSubstituicoes(prev =>
                prev.filter(
                    s => s.id !== subExcluindo.id
                )
            );

            setSubExcluindo(null);

            alert(
                'Substituição excluída com sucesso!'
            );

        } catch {

            alert(
                'Erro ao excluir substituição.'
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">

            <aside className="sidebar">

                <div className="sidebar-header">

                    <div className="logo-icon-small">
                        <ShieldCheck
                            color="#fff"
                            size={24}
                        />
                    </div>

                    <h2>
                        S-<span>RAF</span>
                    </h2>
                </div>

                <nav className="sidebar-nav">

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate(
                                '/dashboard-coordenador'
                            )
                        }
                    >
                        <LayoutDashboard size={20} />
                        <span>Solicitações</span>
                    </button>

                    <button
                        className="nav-item active"
                        onClick={() =>
                            navigate(
                                '/coordenador-substituicoes'
                            )
                        }
                    >
                        <RefreshCw size={20} />
                        <span>Substituições</span>
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate(
                                '/coordenador-aulas'
                            )
                        }
                    >
                        <BookOpen size={20} />
                        <span>Aulas</span>
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate(
                                '/coordenador-usuarios'
                            )
                        }
                    >
                        <Users size={20} />
                        <span>Todos os Usuários</span>
                    </button>

                    <button
                        className="nav-item"
                        onClick={() =>
                            navigate(
                                '/coordenador-calendario'
                            )
                        }
                    >
                        <CalendarDays size={20} />
                        <span>Calendário</span>
                    </button>
                </nav>

                <div className="sidebar-footer">

                    <button
                        className="nav-item text-danger"
                        onClick={() => {

                            localStorage.clear();

                            navigate('/');
                        }}
                    >
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>

                    <button
                        className="user-profile-btn"
                        onClick={() =>
                            setModalPerfilAberto(true)
                        }
                    >

                        <div className="avatar-mini">

                            {fotoUrl ? (

                                <img
                                    src={fotoUrl}
                                    alt="Perfil"
                                    className="avatar-img"
                                />

                            ) : (

                                <User
                                    size={20}
                                    color="#64748b"
                                />
                            )}
                        </div>

                        <div className="user-info">

                            <span className="user-name">
                                {primeiroNome}
                            </span>

                            <span className="user-role">
                                Administrador
                            </span>
                        </div>

                        <Settings
                            size={14}
                            className="perfil-settings-icon"
                        />
                    </button>
                </div>
            </aside>

            <main className="main-content">

                <header className="top-header">

                    <div className="header-title">

                        <button
                            className="btn-voltar"
                            onClick={() =>
                                navigate(
                                    '/coordenador-substituicoes'
                                )
                            }
                        >
                            <ArrowLeft size={16} />
                            Voltar para Substituições
                        </button>

                        <h1>
                            Gerenciar Substituições
                        </h1>

                        <p>
                            Edite ou exclua substituições já registradas.
                        </p>
                    </div>

                    <div className="header-actions">
                        <div className="avatar-top">
                            <User
                                size={20}
                                color="#fff"
                            />
                        </div>
                    </div>
                </header>

                <section className="panel">

                    <div className="panel-header">
                        <h3>
                            Substituições Registradas (
                            {substituicoes.length}
                            )
                        </h3>
                    </div>

                    {loadingDados ? (

                        <p className="loading-text">
                            Carregando...
                        </p>

                    ) : (

                        <table className="schedule-table">

                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Professor Substituto</th>
                                <th>Coordenador</th>
                                <th>Professor Solicitante</th>
                                <th>Data Ausência</th>
                                <th>Motivo</th>
                                <th>Aula</th>
                                <th>Ações</th>
                            </tr>
                            </thead>

                            <tbody>

                            {substituicoes.length > 0 ? (

                                substituicoes.map(s => (

                                    <tr key={s.id}>

                                        <td>{s.id}</td>

                                        <td>
                                            {s.professorSubstituto?.nome || '—'}
                                        </td>

                                        <td>
                                            {s.coordenador?.nome || '—'}
                                        </td>

                                        <td>
                                            {s.solicitacaoAusencia?.professor?.nome || '—'}
                                        </td>

                                        <td>
                                            {s.solicitacaoAusencia?.dataAusencia || '—'}
                                        </td>

                                        <td>
                                            {s.solicitacaoAusencia?.motivo || '—'}
                                        </td>

                                        <td>
                                            {s.solicitacaoAusencia?.aula?.nomeDisciplina || '—'}
                                        </td>

                                        <td>
                                            <div className="acoes-cell">

                                                <button
                                                    className="btn-editar"
                                                    onClick={() =>
                                                        abrirEdicao(s)
                                                    }
                                                >
                                                    Editar
                                                </button>

                                                <button
                                                    className="btn-excluir"
                                                    onClick={() =>
                                                        setSubExcluindo(s)
                                                    }
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))

                            ) : (

                                <tr>
                                    <td
                                        colSpan={8}
                                        style={{
                                            textAlign: 'center',
                                            padding: '24px',
                                            color: '#64748b'
                                        }}
                                    >
                                        Nenhuma substituição registrada.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    )}
                </section>
            </main>

            {subEditando && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setSubEditando(null)
                    }
                >

                    <div
                        className="modal-box"
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

                        <h3>
                            Editar Substituição
                            {subEditando.id}
                        </h3>

                        <p className="modal-sub">
                            Solicitação de{' '}
                            {subEditando.solicitacaoAusencia?.professor?.nome || '—'}
                            {' — '}
                            {subEditando.solicitacaoAusencia?.dataAusencia || ''}
                        </p>

                        <div className="modal-info-row">

                            <span className="modal-info-label">
                                Coordenador
                            </span>

                            <span className="modal-info-value">
                                {subEditando.coordenador?.nome || '—'}
                            </span>
                        </div>

                        <div className="modal-info-row">

                            <span className="modal-info-label">
                                Motivo
                            </span>

                            <span className="modal-info-value">
                                {subEditando.solicitacaoAusencia?.motivo || '—'}
                            </span>
                        </div>

                        <div className="modal-info-row">

                            <span className="modal-info-label">
                                Aula
                            </span>

                            <span className="modal-info-value">
                                {subEditando.solicitacaoAusencia?.aula?.nomeDisciplina || '—'}
                            </span>
                        </div>

                        <form onSubmit={handleAtualizar}>

                            <div className="form-group-modal">

                                <label>
                                    Professor Substituto
                                </label>

                                <select
                                    value={editProfessorId}
                                    onChange={e =>
                                        setEditProfessorId(
                                            e.target.value
                                        )
                                    }
                                    required
                                >

                                    <option
                                        value=""
                                        disabled
                                    >
                                        Selecione um professor
                                    </option>

                                    {professores.map(p => (

                                        <option
                                            key={p.id}
                                            value={p.id}
                                        >
                                            {p.nome} — {p.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="btn-cancelar-modal"
                                    onClick={() =>
                                        setSubEditando(null)
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="btn-salvar-modal"
                                    disabled={loading}
                                >

                                    {loading
                                        ? 'Salvando...'
                                        : 'Salvar Alterações'
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {subExcluindo && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setSubExcluindo(null)
                    }
                >

                    <div
                        className="modal-box modal-box-sm"
                        onClick={e =>
                            e.stopPropagation()
                        }
                    >

                        <h3>
                            Excluir Substituição
                        </h3>

                        <p className="modal-sub">

                            Tem certeza que deseja excluir
                            a substituição #
                            {subExcluindo.id}?

                            {' '}

                            A solicitação voltará para o
                            status

                            {' '}

                            <strong>PENDENTE</strong>.
                        </p>

                        <div className="modal-actions">

                            <button
                                className="btn-cancelar-modal"
                                onClick={() =>
                                    setSubExcluindo(null)
                                }
                            >
                                Cancelar
                            </button>

                            <button
                                className="btn-excluir-modal"
                                disabled={loading}
                                onClick={handleExcluir}
                            >

                                {loading
                                    ? 'Excluindo...'
                                    : 'Sim, Excluir'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalPerfilAberto && (

                <ModalPerfil
                    coordenador={coordenador}
                    fotoUrl={fotoUrl}
                    onClose={() =>
                        setModalPerfilAberto(false)
                    }
                    onSalvar={(novoNome) =>
                        setCoordenador(prev =>
                            prev
                                ? {
                                    ...prev,
                                    nome: novoNome
                                }
                                : prev
                        )
                    }
                    onFotoChange={setFotoUrl}
                />
            )}
        </div>
    );
};

export default GerenciamentoSubstituicao;