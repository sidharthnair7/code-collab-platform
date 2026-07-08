import { useState } from "react";

import MainPart from "./components/mainPart";
import LandingPage from "./components/LandingPage";

const TOKEN_KEY = "codecollab_token";

function decodeJwt(token) {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

function isExpired(payload) {
    return payload.exp && payload.exp * 1000 < Date.now();
}

export default function App() {
    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return null;
        const payload = decodeJwt(token);
        if (!payload || isExpired(payload)) {
            localStorage.removeItem(TOKEN_KEY);
            return null;
        }
        return { token, username: payload.sub };
    });

    function handleLogin(token) {
        const payload = decodeJwt(token);
        if (!payload) return;
        localStorage.setItem(TOKEN_KEY, token);
        setAuth({ token, username: payload.sub });
    }

    function handleLogout() {
        localStorage.removeItem(TOKEN_KEY);
        setAuth(null);
    }

    if (!auth) {
        return <LandingPage onLogin={handleLogin} />;
    }

    return <MainPart token={auth.token} username={auth.username} onLogout={handleLogout} />;
}
