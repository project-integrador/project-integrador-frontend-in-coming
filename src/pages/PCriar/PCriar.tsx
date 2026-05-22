import type { JSX } from "react";
import Criar from "../../components/Criar/Criar";

function PCriar(): JSX.Element {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Criar />
        </div>
    );
}

export default PCriar;