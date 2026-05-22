import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './TelaTabelas.css';

const TelaTabelas: React.FC = () => {
    const navigate = useNavigate(); // ← ADICIONADO
    const [dados, setDados] = useState<any[]>([]);
    const [erro, setErro] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const testarBanco = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/professor/todos`);

                const dadosRecebidos = Array.isArray(response.data) ? response.data : [response.data];
                setDados(dadosRecebidos);

            } catch (error: any) {
                console.error("Erro na conexão:", error);

                if (error.response) {
                    setErro(`Erro ${error.response.status}: ${error.response.statusText}`);
                } else {
                    setErro("Erro de Rede: O servidor Spring Boot (Java) está rodando?");
                }
            } finally {
                setLoading(false);
            }
        };

        testarBanco();
    }, []);

    return (
        <div className="tabelas-container">

            {/* BOTÃO VOLTAR ← ADICIONADO */}
            <button className="btn-voltar" onClick={() => navigate('/dashboard-professor')}>
                ← Voltar ao Dashboard
            </button>

            <h1 className="tabelas-title">🧪 Teste de Conexão com o Banco</h1>

            {loading && <p className="loading-text">Carregando dados do banco...</p>}

            {erro && (
                <div className="alert-error">
                    <strong>🚨 Ops, falha na conexão:</strong> {erro}
                </div>
            )}

            {!loading && !erro && dados.length > 0 && (
                <>
                    <div className="alert-success">
                        <strong>✅ Sucesso!</strong> Conectou no banco e trouxe os dados dos professores.
                    </div>

                    <table className="tabela-dados">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Matrícula</th>
                            <th>Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {dados.map((prof, index) => (
                            <tr key={index}>
                                <td>#{prof.id || 'N/A'}</td>
                                <td>{prof.nome || 'N/A'}</td>
                                <td>{prof.email || 'N/A'}</td>
                                <td>{prof.matricula || 'N/A'}</td>
                                <td>
                                        <span className={prof.ativo ? "badge-ativo" : "badge-inativo"}>
                                            {prof.ativo ? 'Ativo' : 'Inativo / Não info.'}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default TelaTabelas;