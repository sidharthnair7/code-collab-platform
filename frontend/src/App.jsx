import { useState } from "react";

import Login from "./components/Login";
import Signup from "./components/Signup";
import MainPart from "./components/mainPart";

export default function App() {
    const [token, setToken] = useState(null);
    const [username, setUsername] = useState(null);
    const [mode, setMode] = useState("login"); // login | signup
    function handleLogin(token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.sub); // 'sub' is the email, set as subject in JwtService
        setToken(token);
    }
    function handleLogout() {
        setToken(null);
        setUsername(null);
    }

    if (!token) {
        return (
            <>

                {mode === "login" ? (
                    <Login
                        onLogin={handleLogin}
                        switchMode={() => setMode("signup")}
                    />
                ) : (
                    <Signup
                        onSignup={handleLogin}
                        switchMode={() => setMode("login")}
                    />
                )}
            </>
        );
    }


    console.log("staging deploy test");

    return <MainPart token={token} username={username} onLogout={handleLogout} />;

}


