export interface AulaDTO {
    id?: number;
    nomeDisciplina: string;
    cargaHoraria: number;
    professorTitular: {
        id: number;
        nome: string;
        email: string;
        matricula: string;
        ativo: boolean;
    };
}