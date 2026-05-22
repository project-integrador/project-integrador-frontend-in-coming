import axios from "axios";

const API_URL = "http://localhost:8080/auth/login";

export interface LoginRequestDTO {
    email: string;
    password: string;
}

export interface LoginResponseDTO {
    token: string;
    role: string; // ← ADICIONE ESSA LINHA
}

export const login = async (data: LoginRequestDTO) => {
    return await axios.post<LoginResponseDTO>(API_URL, data);
};