import axios from "axios";
import { SolicitacaoAusenciaDTO } from "../dtos/SolicitacaoAusenciaDTO";

const API_URL = "http://localhost:8080/solicitacao-ausencia";

export const criarSolicitacao = async (
    data: SolicitacaoAusenciaDTO
) => {
    return await axios.post(API_URL, data);
};

export const buscarSolicitacaoPorId = async (
    id: number
) => {
    return await axios.get<SolicitacaoAusenciaDTO>(
        `${API_URL}/${id}`
    );
};

export const listarPendentes = async () => {
    return await axios.get<SolicitacaoAusenciaDTO[]>(
        `${API_URL}/pendentes`
    );
};