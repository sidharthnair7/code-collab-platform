import { useState } from "react";
import { login } from "../api";

export default function Login({ onLogin, switchMode }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            const data = await login(email, password);
            onLogin(data.token);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <button type="submit">Login</button>
            <p onClick={switchMode} style={{ cursor: "pointer" }}>
                No account? Sign up
            </p>
        </form>
    );
}