import React, { useState, useEffect } from 'react';
import { User, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AulaDTO } from '../../dtos/AulaDTO';

const SolicitarSubstituicao: React.FC = () => {
    const navigate = useNavigate();

    const [dataAusencia, setDataAusencia] = useState('');
    const [motivo, setMotivo] = useState('');
    const [aulaId, setAulaId] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [aulas, setAulas] = useState<AulaDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [professorId, setProfessorId] = useState<number | null>(null);

    useEffect(() => {
        const email = localStorage.getItem('userEmail') || '';

        axios.get(`http://localhost:8080/professor?email=${email}`)
            .then(res => setProfessorId(res.data.id))
            .catch(err => console.error('Erro ao buscar professor:', err));

        axios.get(`http://localhost:8080/aula?email=${email}`)
            .then(res => setAulas(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error('Erro ao buscar aulas:', err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!professorId) {
            alert('Erro: professor não identificado. Faça login novamente.');
            return;
        }

        if (!aulaId) {
            alert('Selecione uma aula.');
            return;
        }

        setLoading(true);

        try {
            await axios.post('http://localhost:8080/solicitacao', {
                dataAusencia,
                motivo,
                status: 'PENDENTE',
                professor: { id: professorId },
                aula: { id: parseInt(aulaId) }
            });

            alert('Solicitação enviada com sucesso!');
            navigate('/minhas-solicitacoes');

        } catch (err) {
            alert('Erro ao enviar solicitação. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="main-content">
            <header className="top-header">
                <div className="header-title">
                    <h1>Solicitar Substituição</h1>
                    <p>Preencha os dados abaixo para solicitar um professor substituto.</p>
                </div>
                <div className="header-actions">
                    <div className="avatar-top"><User size={20} color="#fff" /></div>
                </div>
            </header>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Data da Ausência</label>
                            <input
                                type="date"
                                value={dataAusencia}
                                onChange={(e) => setDataAusencia(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Motivo</label>
                            <select
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                required
                            >
                                <option value="" disabled>Selecione um motivo</option>
                                <option value="Saúde">Problemas de Saúde</option>
                                <option value="Pessoal">Motivos Pessoais</option>
                                <option value="Academico">Evento Acadêmico</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Aula Afetada</label>
                        <select
                            value={aulaId}
                            onChange={(e) => setAulaId(e.target.value)}
                            required
                        >
                            <option value="" disabled>Selecione a aula</option>
                            {aulas.map(a => (
                                <option key={a.id} value={a.id}>
                                    #{a.id} — {a.nomeDisciplina} ({a.cargaHoraria}h)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Observações</label>
                        <textarea
                            rows={4}
                            placeholder="Adicione detalhes importantes para o substituto ou coordenador..."
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Anexo de Comprovante (Opcional)</label>
                        <div className="upload-area">
                            <UploadCloud size={32} color="#64748b" />
                            <p>Arraste e solte o arquivo aqui ou <strong>clique para fazer upload</strong></p>
                            <span>JPG, PNG ou PDF (Máx. 5MB)</span>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancelar"
                            onClick={() => navigate('/minhas-solicitacoes')}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-enviar" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar Solicitação'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default SolicitarSubstituicao;