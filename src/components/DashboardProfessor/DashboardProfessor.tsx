import React from 'react';
import './DashboardProfessor.css';
import {
    Calendar, FileText, Users,
    CheckCircle, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ProfessorDTO } from '../../dtos/ProfessorDTO';
import { AulaDTO } from '../../dtos/AulaDTO';
import { SolicitacaoAusenciaDTO } from '../../dtos/SolicitacaoAusenciaDTO';
import { SubstituicaoDTO } from '../../dtos/SubstituicaoDTO';

export interface DashboardProps {
    professor: ProfessorDTO | null;
    minhasAulas: AulaDTO[];
    minhasSolicitacoes: SolicitacaoAusenciaDTO[];
    minhasSubstituicoes: SubstituicaoDTO[];
}

const DashboardProfessor: React.FC<DashboardProps> = ({
                                                          professor, minhasAulas, minhasSolicitacoes, minhasSubstituicoes
                                                      }) => {

    const navigate = useNavigate();

    const formatarData = (dataStr: string) => {
        if (!dataStr) return '';
        const partes = dataStr.split('-');
        if (partes.length !== 3) return dataStr;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    };

    return (
        <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>

            {/* Cabeçalho */}
            <header className="top-header">
                <div className="greeting">
                    <h1>Olá, Professor. {professor?.nome?.split(' ')[0] || ''}!</h1>
                    <p>Aqui está um resumo do seu dia com base no sistema.</p>
                </div>
            </header>

            {/* Cards de Resumo */}
            <section className="summary-cards">
                <div className="card">
                    <div className="card-icon blue"><Calendar size={24} /></div>
                    <div className="card-info">
                        <span className="label">Minhas Aulas</span>
                        <span className="value">{minhasAulas.length}</span>
                        <span className="desc">Disciplinas cadastradas</span>
                    </div>
                </div>
                <div className="card">
                    <div className="card-icon light-blue"><Users size={24} /></div>
                    <div className="card-info">
                        <span className="label">Carga Horária</span>
                        <span className="value">{minhasAulas.reduce((acc, aula) => acc + aula.cargaHoraria, 0)}h</span>
                        <span className="desc">Horas totais alocadas</span>
                    </div>
                </div>
                <div className="card">
                    <div className="card-icon green"><FileText size={24} /></div>
                    <div className="card-info">
                        <span className="label">Solicitações</span>
                        <span className="value">{minhasSolicitacoes.length}</span>
                        <span className="desc">Pendentes no momento</span>
                    </div>
                </div>
                <div className="card">
                    <div className="card-icon purple"><CheckCircle size={24} /></div>
                    <div className="card-info">
                        <span className="label">Substituições</span>
                        <span className="value">{minhasSubstituicoes.length}</span>
                        <span className="desc">Registradas no histórico</span>
                    </div>
                </div>
            </section>

            {/* Grid de Conteúdo */}
            <div className="content-grid">

                {/* Coluna Esquerda */}
                <div className="left-column">
                    <section className="panel schedule-panel">
                        <div className="panel-header">
                            <div className="panel-title">
                                <Calendar size={20} color="#3b82f6" />
                                <h3>Disciplinas Atribuídas</h3>
                            </div>
                        </div>
                        <table className="schedule-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Disciplina</th>
                                <th>Carga Horária</th>
                                <th>Status Prof.</th>
                            </tr>
                            </thead>
                            <tbody>
                            {minhasAulas.length > 0 ? (
                                minhasAulas.map((aula) => (
                                    <tr key={aula.id}>
                                        <td>#{aula.id}</td>
                                        <td>{aula.nomeDisciplina}</td>
                                        <td>{aula.cargaHoraria} horas</td>
                                        <td>
                                                <span className="badge-presencial">
                                                    {professor?.ativo ? 'Ativo' : 'Inativo'}
                                                </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                        Nenhuma disciplina atribuída encontrada.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </section>
                </div>

                {/* Coluna Direita */}
                <div className="right-column">
                    <div className="cta-box">
                        <div className="cta-content">
                            <h3>Precisará se ausentar?</h3>
                            <p>Solicite um substituto para suas aulas de forma prática.</p>
                            <button
                                className="btn-primary-white"
                                onClick={() => navigate('/solicitar-substituicao')}
                            >
                                Nova Solicitação
                            </button>
                        </div>
                    </div>

                    <section className="panel requests-panel">
                        <div className="panel-header">
                            <h3>Suas Solicitações</h3>
                            <button
                                className="link-blue"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
                                onClick={() => navigate('/minhas-solicitacoes')}
                            >
                                Ver todas
                            </button>
                        </div>
                        <div className="request-list">
                            {minhasSolicitacoes.length > 0 ? (
                                minhasSolicitacoes.map((solicitacao) => (
                                    <div className="request-item" key={solicitacao.id}>
                                        <div className="request-icon blue"><Clock size={20} /></div>
                                        <div className="request-details">
                                            <h4>{formatarData(solicitacao.dataAusencia)}</h4>
                                            <span>Aula ID: #{solicitacao.aula.id}</span>
                                        </div>
                                        <span className={`badge-status ${solicitacao.status.toLowerCase()}`}>
                                            {solicitacao.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '10px' }}>
                                    Nenhuma solicitação encontrada.
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};

export default DashboardProfessor;
