// Endereço onde o Java Spring Boot está rodando
const JAVA_BACKEND_URL = 'http://localhost:8080';

/**
 * Função utilitária para o Node.js fazer requisições para o Java
 * @param endpoint - O caminho da API do Java (ex: '/professores')
 * @param options - Opções do fetch (método, headers, body)
 */
export const apiJava = async (endpoint: string, options?: RequestInit): Promise<any> => {
    try {
        const response = await fetch(`${JAVA_BACKEND_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(options?.headers || {})
            },
            ...options
        });

        // Se o Java retornar erro (400, 401, 500, etc)
        if (!response.ok) {
            throw new Error(`Erro na comunicação com o Java: Status ${response.status}`);
        }

        // Retorna a resposta do Java em formato JSON
        return await response.json();

    } catch (error) {
        console.error(`[conexaoJava] Erro ao conectar com ${endpoint}:`, error);
        throw error;
    }
};