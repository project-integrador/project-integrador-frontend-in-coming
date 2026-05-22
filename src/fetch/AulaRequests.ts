import axios from "axios";
import { AulaDTO } from "../dtos/AulaDTO";

const API_URL = "http://localhost:8080/aula";

export const listarAulas = async () => {
    return await axios.get<AulaDTO[]>(API_URL);
};

export const buscarAulaPorId = async (id: number) => {
    return await axios.get<AulaDTO>(`${API_URL}/${id}`);
};

export const cadastrarAula = async (aula: AulaDTO) => {
    return await axios.post(API_URL, aula);
};

export const atualizarAula = async (
    id: number,
    aula: AulaDTO
) => {
    return await axios.put(`${API_URL}/${id}`, aula);
};

export const deletarAula = async (id: number) => {
    return await axios.delete(`${API_URL}/${id}`);
};