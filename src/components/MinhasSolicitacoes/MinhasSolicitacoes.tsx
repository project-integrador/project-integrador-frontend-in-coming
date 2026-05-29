import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Pencil, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SolicitacaoAusenciaDTO } from '../../dtos/SolicitacaoAusenciaDTO';
import './MinhasSolicitacoes.css';

interface Props {
    solicitacoes: SolicitacaoAusenciaDTO[];
    onAtualizar: () => void;
}

const statusIcon = (status: string) => {
    switch (status.toUpperCase()) {
        case 'PENDENTE':  return <AlertCircle size={18} color="#f59e0b" />;
        case 'RESOLVIDA': return <CheckCircle size={18} color="#10b981" />;
        case 'REJEITADA': return <XCircle size={18} color="#ef4444" />;
        case 'APROVADO':  return <CheckCircle size={18} color="#3b82f6" />;
        case 'RECUSADO':  return <XCircle size={18} color="#ef4444" />;
        default:          return <Clock size={18} color="#64748b" />;
    }
};

const statusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
        case 'PENDENTE':  return 'solicitacao-badge badge-pendente';
        case 'RESOLVIDA': return 'solicitacao-badge badge-resolvida';
        case 'REJEITADA': return 'solicitacao-badge badge-rejeitada';
        case 'APROVADO':  return 'solicitacao-badge badge-aprovado';
        case 'RECUSADO':  return 'solicitacao-badge badge-recusado';
        default:          return 'solicitacao-badge badge-default';
    }
};

const formatarData = (dataStr: string) => {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
};

const MinhasSolicitacoes: React.FC<Props> = ({ solicitacoes, onAtualizar }) => {
    const navigate = useNavigate();

    // ── Modal Editar ──
    const [modalEditarAberto, setModalEditarAberto] = useState(false);
    const [solicitacaoEditando, setSolicitacaoEditando] = useState<SolicitacaoAusenciaDTO | null>(null);
    const [editData, setEditData] = useState('');
    const [editMotivo, setEditMotivo] = useState('');
    const [loadingEditar, setLoadingEditar] = useState(false);

    // ── Modal Excluir ──
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
    const [solicitacaoExcluindo, setSolicitacaoExcluindo] = useState<SolicitacaoAusenciaDTO | null>(null);
    const [loadingExcluir, setLoadingExcluir] = useState(false);

    const abrirEdicao = (s: SolicitacaoAusenciaDTO) => {
        setSolicitacaoEditando(s);
        setEditData(s.dataAusencia);
        setEditMotivo(s.motivo);
        setModalEditarAberto(true);
    };

    const abrirExclusao = (s: SolicitacaoAusenciaDTO) => {
        setSolicitacaoExcluindo(s);
        setModalExcluirAberto(true);
    };

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!solicitacaoEditando?.id) return;
        setLoadingEditar(true);
        try {
            await axios.put(`http://localhost:8080/solicitacao/${solicitacaoEditando.id}`, {
                dataAusencia: editData,
                motivo: editMotivo,
                status: solicitacaoEditando.status,
                aula: { id: solicitacaoEditando.aula.id },
                professor: { id: solicitacaoEditando.professor.id },
            });
            alert('Solicitação atualizada com sucesso!');
            setModalEditarAberto(false);
            onAtualizar();
        } catch {
            alert('Erro ao atualizar solicitação.');
        } finally {
            setLoadingEditar(false);
        }
    };

    const handleExcluir = async () => {
        if (!solicitacaoExcluindo?.id) return;
        setLoadingExcluir(true);
        try {
            await axios.delete(`http://localhost:8080/solicitacao/${solicitacaoExcluindo.id}`);
            alert('Solicitação excluída com sucesso!');
            setModalExcluirAberto(false);
            setSolicitacaoExcluindo(null);
            onAtualizar();
        } catch {
            alert('Erro ao excluir solicitação.');
        } finally {
            setLoadingExcluir(false);
        }
    };

    return (
        <main className="solicitacoes-container">
            <div className="solicitacoes-inner">

                <div className="solicitacoes-header">
                    <h1>Minhas Solicitações</h1>
                    <p>Histórico completo das suas solicitações de ausência</p>
                </div>

                <button
                    className="btn-nova-solicitacao"
                    onClick={() => navigate('/solicitar-substituicao')}
                >
                    + Nova Solicitação
                </button>

                {solicitacoes.length === 0 ? (
                    <div className="solicitacoes-empty">
                        <Clock size={40} />
                        <p>Nenhuma solicitação encontrada.</p>
                        <span>Clique em <strong>+ Nova Solicitação</strong> para criar a primeira.</span>
                    </div>
                ) : (
                    <div className="solicitacoes-lista">
                        {solicitacoes.map(s => (
                            <div key={s.id} className="solicitacao-card">
                                <div className="solicitacao-icone">
                                    {statusIcon(s.status)}
                                </div>
                                <div className="solicitacao-info">
                                    <div className="solicitacao-titulo">
                                        Ausência em {formatarData(s.dataAusencia)}
                                    </div>
                                    <div className="solicitacao-detalhe">
                                        {s.motivo} &nbsp;·&nbsp; Aula <strong>#{s.aula.id}</strong>
                                    </div>
                                </div>

                                <span className={statusBadgeClass(s.status)}>
                                    {s.status}
                                </span>

                                {s.status.toUpperCase() === 'PENDENTE' && (
                                    <div className="solicitacao-acoes">
                                        <button
                                            className="btn-acao-editar"
                                            onClick={() => abrirEdicao(s)}
                                            title="Editar"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            className="btn-acao-excluir"
                                            onClick={() => abrirExclusao(s)}
                                            title="Excluir"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modal Editar ── */}
            {modalEditarAberto && solicitacaoEditando && (
                <div className="modal-overlay" onClick={() => setModalEditarAberto(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-perfil-header">
                            <h3>Editar Solicitação <span className="modal-id">#{solicitacaoEditando.id}</span></h3>
                            <button className="btn-fechar-modal" onClick={() => setModalEditarAberto(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSalvar}>
                            <div className="form-group-modal">
                                <label>Data da Ausência</label>
                                <input
                                    type="date"
                                    value={editData}
                                    onChange={e => setEditData(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group-modal">
                                <label>Motivo</label>
                                <input
                                    type="text"
                                    value={editMotivo}
                                    onChange={e => setEditMotivo(e.target.value)}
                                    placeholder="Descreva o motivo"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancelar-modal" onClick={() => setModalEditarAberto(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-salvar-modal" disabled={loadingEditar}>
                                    {loadingEditar ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Modal Excluir ── */}
            {modalExcluirAberto && solicitacaoExcluindo && (
                <div className="modal-overlay" onClick={() => setModalExcluirAberto(false)}>
                    <div className="modal-box modal-excluir" onClick={e => e.stopPropagation()}>
                        <div className="modal-perfil-header">
                            <h3>Excluir Solicitação <span className="modal-id">#{solicitacaoExcluindo.id}</span></h3>
                            <button className="btn-fechar-modal" onClick={() => setModalExcluirAberto(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <p className="modal-excluir-aviso">
                            Tem certeza que deseja excluir esta solicitação? Esta ação não pode ser desfeita.
                        </p>
                        <div className="modal-excluir-info">
                            <div className="modal-info-row">
                                <span className="modal-info-label">Data</span>
                                <span className="modal-info-value">{formatarData(solicitacaoExcluindo.dataAusencia)}</span>
                            </div>
                            <div className="modal-info-row">
                                <span className="modal-info-label">Motivo</span>
                                <span className="modal-info-value">{solicitacaoExcluindo.motivo}</span>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancelar-modal" onClick={() => setModalExcluirAberto(false)}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-confirmar-excluir"
                                onClick={handleExcluir}
                                disabled={loadingExcluir}
                            >
                                <Trash2 size={14} />
                                {loadingExcluir ? 'Excluindo...' : 'Confirmar Exclusão'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default MinhasSolicitacoes;
