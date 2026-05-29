export interface SolicitacaoAusenciaDTO {
    id?: number;
    dataAusencia: string;
    motivo: string;
    observacoes?: string;
    status: string;

    aula: {
        id: number;
        nomeDisciplina?: string;
    };

    professor: {
        id: number;
        nome?: string;
    };
}
