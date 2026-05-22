import type { JSX } from "react";
import Login from "../../components/Login/Login";



function PHome(): JSX.Element {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Login />
        </div>
    );
}

export default PHome;