import axios from "axios";
import { CoordenadorDTO } from "../dtos/CoordenadorDTO";

const API_URL = "http://localhost:8080/coordenador";

export const cadastrarCoordenador = async (
    coordenador: CoordenadorDTO
) => {
    return await axios.post(API_URL, coordenador);
};

export const buscarCoordenadorPorEmail = async (
    email: string
) => {
    return await axios.get<CoordenadorDTO>(
        `${API_URL}?email=${email}`
    );
};

export const atualizarCoordenador = async (
    id: number,
    coordenador: CoordenadorDTO
) => {
    return await axios.put(
        `${API_URL}/${id}`,
        coordenador
    );
};

export const deletarCoordenador = async (
    email: string
) => {
    return await axios.delete(
        `${API_URL}?email=${email}`
    );
};