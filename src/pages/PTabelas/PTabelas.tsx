import React from 'react';
import TelaTabelas from '../../components/Tabelas/TelaTabelas';

const PTabelas: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <TelaTabelas />
        </div>
    );
};

export default PTabelas;