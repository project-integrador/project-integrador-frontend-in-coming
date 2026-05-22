import React from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SolicitacaoAusenciaDTO } from '../../dtos/SolicitacaoAusenciaDTO';
import './MinhasSolicitacoes.css';

interface Props {
    solicitacoes: SolicitacaoAusenciaDTO[];
}

const statusIcon = (status: string) => {
    switch (status.toUpperCase()) {
        case 'PENDENTE':  return <AlertCircle size={18} color="#f59e0b" />;
        case 'RESOLVIDA': return <CheckCircle size={18} color="#10b981" />;
        case 'REJEITADA': return <XCircle size={18} color="#ef4444" />;
        default:          return <Clock size={18} color="#64748b" />;
    }
};

const statusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
        case 'PENDENTE':  return 'solicitacao-badge badge-pendente';
        case 'RESOLVIDA': return 'solicitacao-badge badge-resolvida';
        case 'REJEITADA': return 'solicitacao-badge badge-rejeitada';
        default:          return 'solicitacao-badge badge-default';
    }
};

const formatarData = (dataStr: string) => {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
};

const MinhasSolicitacoes: React.FC<Props> = ({ solicitacoes }) => {
    const navigate = useNavigate();

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
                                        Motivo: {s.motivo} &nbsp;·&nbsp; Aula ID: #{s.aula.id}
                                    </div>
                                </div>

                                <span className={statusBadgeClass(s.status)}>
                                    {s.status}
                                </span>

                            </div>
                        ))}
                    </div>
                )}

            </div>
        </main>
    );
};

export default MinhasSolicitacoes;