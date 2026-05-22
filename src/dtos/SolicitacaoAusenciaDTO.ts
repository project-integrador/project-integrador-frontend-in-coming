export interface SolicitacaoAusenciaDTO {
    id?: number;

    dataAusencia: string;
    motivo: string;
    status: string;

    aula: {
        id: number;
    };

    professor: {
        id: number;
    };
}