import { useState } from "react";

import Header from "./components/header";
import Login from "./components/Login";
import Signup from "./components/Signup";
import MainPart from "./components/mainPart";

export default function App() {
    const [token, setToken] = useState(null);
    const [mode, setMode] = useState("login"); // login | signup

    if (!token) {
        return (
            <>
                <Header />
                {mode === "login" ? (
                    <Login
                        onLogin={setToken}
                        switchMode={() => setMode("signup")}
                    />
                ) : (
                    <Signup
                        onSignup={setToken}
                        switchMode={() => setMode("login")}
                    />
                )}
            </>
        );
    }

    return <MainPart token={token} />;
}
