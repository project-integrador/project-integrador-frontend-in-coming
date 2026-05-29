import type { JSX } from "react";
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import NavegacaoProfessor from "../../components/NavegacaoProfessor/NavegacaoProfessor";
import DashboardProfessor from "../../components/DashboardProfessor/DashboardProfessor";
import SolicitarSubstituicao from "../../components/SolicitarSubstituicao/SolicitarSubstituicao";
import MinhasSolicitacoes from "../../components/MinhasSolicitacoes/MinhasSolicitacoes";
import PTabelas from "../PTabelas/PTabelas";

import { ProfessorDTO } from "../../dtos/ProfessorDTO";
import { AulaDTO } from "../../dtos/AulaDTO";
import { SolicitacaoAusenciaDTO } from "../../dtos/SolicitacaoAusenciaDTO";
import { SubstituicaoDTO } from "../../dtos/SubstituicaoDTO";

function PDashboardProfessor(): JSX.Element {

    const location = useLocation();
    const email = localStorage.getItem("userEmail") || "";

    const [professor, setProfessor] = useState<ProfessorDTO | null>(null);
    const [minhasAulas, setMinhasAulas] = useState<AulaDTO[]>([]);
    const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<SolicitacaoAusenciaDTO[]>([]);
    const [minhasSubstituicoes, setMinhasSubstituicoes] = useState<SubstituicaoDTO[]>([]);

    // ← Função separada para buscar solicitações
    const carregarSolicitacoes = useCallback(() => {
        axios.get(`http://localhost:8080/solicitacao/professor?email=${email}`)
            .then(res => setMinhasSolicitacoes(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Erro ao buscar solicitações:", err));
    }, [email]);

    useEffect(() => {
        axios.get(`http://localhost:8080/professor?email=${email}`)
            .then(res => setProfessor(res.data))
            .catch(err => console.error("Erro ao buscar professor:", err));

        axios.get(`http://localhost:8080/aula?email=${email}`)
            .then(res => setMinhasAulas(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Erro ao buscar aulas:", err));

        carregarSolicitacoes(); // ← usa a função separada

        axios.get(`http://localhost:8080/substituicao`)
            .then(res => setMinhasSubstituicoes(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Erro ao buscar substituições:", err));

    }, [location.pathname]);

    const renderConteudo = () => {
        switch (location.pathname) {
            case '/solicitar-substituicao':
                return <SolicitarSubstituicao />;
            case '/minhas-solicitacoes':
                return (
                    <MinhasSolicitacoes
                        solicitacoes={minhasSolicitacoes}
                        onAtualizar={carregarSolicitacoes}  // ← direto, sem inline
                    />
                );
            case '/calendario':
                return <PTabelas />;
            default:
                return (
                    <DashboardProfessor
                        professor={professor}
                        minhasAulas={minhasAulas}
                        minhasSolicitacoes={minhasSolicitacoes}
                        minhasSubstituicoes={minhasSubstituicoes}
                    />
                );
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <NavegacaoProfessor />
            {renderConteudo()}
        </div>
    );
}

export default PDashboardProfessor;
