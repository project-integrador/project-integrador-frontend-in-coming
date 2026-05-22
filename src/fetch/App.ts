import express, { Application, Request, Response } from 'express';
import cors from 'cors';

// Aqui você importará as suas rotas (vou deixar comentado como exemplo)
// import rotasProfessor from './routes/ProfessorRoutes';
// import rotasCoordenador from './routes/CoordenadorRoutes';

// Tipando a variável app como uma Aplicação Express
const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Rota de teste simples (tipando requisição e resposta)
app.get('/', (req: Request, res: Response) => {
    res.send('Servidor Node.js rodando com TypeScript!');
});

// Configurando as rotas da API
// app.use('/api/professores', rotasProfessor);
// app.use('/api/coordenadores', rotasCoordenador);

// Porta do servidor (3333 conforme o seu arquivo original)
const PORT = 3333;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

export default app;