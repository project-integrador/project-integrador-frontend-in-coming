import axios from "axios";
import { SubstituicaoDTO } from "../dtos/SubstituicaoDTO";

const API_URL = "http://localhost:8080/substituicao";

export const listarSubstituicoes = async () => {

    return await axios.get<SubstituicaoDTO[]>(
        API_URL
    );
};

export const buscarSubstituicaoPorId = async (
    id: number
) => {

    return await axios.get<SubstituicaoDTO>(
        `${API_URL}/${id}`
    );
};

export const registrarSubstituicao = async (
    data: SubstituicaoDTO
) => {

    return await axios.post(
        API_URL,
        data
    );
};

export const atualizarSubstituicao = async (
    id: number,
    data: SubstituicaoDTO
) => {

    return await axios.put(
        `${API_URL}/${id}`,
        data
    );
};

export const cancelarSubstituicao = async (
    id: number
) => {

    return await axios.delete(
        `${API_URL}/${id}`
    );
};