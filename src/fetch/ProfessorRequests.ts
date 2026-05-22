import axios from "axios";
import { ProfessorDTO } from "../dtos/ProfessorDTO";

const API_URL = "http://localhost:8080/professor";

// Criamos uma função rápida para pegar o token e montar o cabeçalho
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const cadastrarProfessor = async (
    professor: ProfessorDTO
) => {
    // Adicionamos o getAuthHeaders() como último parâmetro
    return await axios.post(API_URL, professor, getAuthHeaders());
};

export const buscarProfessorPorEmail = async (
    email: string
) => {
    return await axios.get<ProfessorDTO>(
        `${API_URL}?email=${email}`,
        getAuthHeaders() // Aqui o "crachá" é enviado!
    );
};

export const atualizarProfessor = async (
    id: number,
    professor: ProfessorDTO
) => {
    return await axios.put(
        `${API_URL}/${id}`,
        professor,
        getAuthHeaders()
    );
};

export const deletarProfessor = async (
    email: string
) => {
    return await axios.delete(
        `${API_URL}?email=${email}`,
        getAuthHeaders()
    );
};