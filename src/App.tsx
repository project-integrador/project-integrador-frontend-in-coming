import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Importando as Páginas
import PGerenciamentoProfessoresCoordenador from './pages/PGerenciamentoProfessoresCoordenador/PGerenciamentoProfessoresCoordenador';
import PGerenciamentoSubstituicao from './pages/PGerenciamentoSubstituicao/PGerenciamentoSubstituicao';
import PSubstituicaoCoordenador from './pages/PSubstituicaoCoordenador/PSubstituicaoCoordenador';
import PCalendarioCoordenador from './pages/PCalendarioCoordenador/PCalendarioCoordenador';
import PDashboardCoordenador from "./pages/PDashboardCoordenador/PDashboardCoordenador";
import PCalendarioProfessor from './pages/PCalendarioProfessor/PCalendarioProfessor';
import PDashboardProfessor from './pages/PDashboardProfessor/PDashboardProfessor';
import PAulasCoordenador from './pages/PAulasCoordenador/PAulasCoordenador';
import PCriarAulas from './components/CriarAulas/CriarAulas';
import PTabelas from './pages/PTabelas/PTabelas';
import PCriar from './pages/PCriar/PCriar';
import PHome from './pages/PHome/PHome'; // Substitua pelo caminho real

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Rota inicial / Home */}
                <Route path="/" element={<PHome />} />

                {/* Rota de Login */}
                <Route path="/login" element={<PHome />} />

                {/* Rota do Dashboard do Professor */}
                <Route path="/dashboard-professor" element={<PDashboardProfessor />} />

                <Route path="/calendario" element={<PTabelas />} />

                {/* Criar */}
                <Route path="/cadastro" element={<PCriar/>} />

                {/* Solicitar */}
                <Route path="/solicitar-substituicao" element={<PDashboardProfessor />} />

                {/* Coordenador */}
                <Route path="/dashboard-coordenador"  element={<PDashboardCoordenador />} />

                <Route path="/coordenador-usuarios"   element={<PDashboardCoordenador />} />


                <Route path="/minhas-solicitacoes" element={<PDashboardProfessor />} />

                <Route path="/coordenador-gerenciar-professores" element={<PGerenciamentoProfessoresCoordenador />} />

                {/* Calendario Professor */}
                <Route path="/calendario-professor" element={<PCalendarioProfessor />} />

                {/* Calendario Coordenador */}
                <Route path="/coordenador-calendario" element={<PCalendarioCoordenador />} />

                {/* Criar Aulas */}
                <Route path="/coordenador-criar-aulas" element={<PCriarAulas />} />


                <Route path="/coordenador-gerenciar-substituicoes" element={<PGerenciamentoSubstituicao />} />

                {/* Aulas Coordenador */}
                <Route path="/coordenador-aulas" element={<PAulasCoordenador />} />

                {/* Substituição */}
                <Route path="/coordenador-substituicoes" element={<PSubstituicaoCoordenador />} />

                {/* Redirecionamento para rota 404 ou Home caso digitem algo errado */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;