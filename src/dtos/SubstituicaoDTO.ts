export interface SubstituicaoDTO {

    id?: number;

    coordenador: {
        id: number;
    };

    professorSubstituto: {
        id: number;
    };

    solicitacaoAusencia: {
        id: number;
    };
}