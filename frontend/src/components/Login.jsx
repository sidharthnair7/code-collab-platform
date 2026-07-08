import { useState } from "react";
import { login } from "../api";

function EyeIcon({ off }) {
    return off ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M3 3l18 18M10.6 10.6a2.5 2.5 0 003.5 3.5M6.7 6.9C4.5 8.2 3 10 2 12c1.8 3.6 5.4 6.5 10 6.5 1.7 0 3.3-.4 4.7-1.1M9.9 4.8A10.6 10.6 0 0112 4.5c4.6 0 8.2 2.9 10 7.5-.5 1-1.1 1.9-1.9 2.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M2 12c1.8-4.6 5.4-7.5 10-7.5S20.2 7.4 22 12c-1.8 4.6-5.4 7.5-10 7.5S3.8 16.6 2 12z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
        </svg>
    );
}

export default function Login({ onLogin, switchMode }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await login(email, password);
            onLogin(data.token);
        } catch {
            setError("Invalid email or password");
            setLoading(false);
        }
    }

    return (
        <>
            <div className="auth-logo">
                <div className="auth-logo-mark">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M8 3L3 8l5 5M16 3l5 5-5 5M14 3l-4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span>CodeCollab</span>
            </div>

            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to continue coding together</p>

            {error && (
                <div className="auth-error" role="alert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {error}
                </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        autoFocus
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="login-password">Password</label>
                    <div className="auth-input-wrap">
                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            className="auth-eye"
                            onClick={() => setShowPassword((p) => !p)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            <EyeIcon off={showPassword} />
                        </button>
                    </div>
                </div>

                <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? <span className="auth-spinner" aria-hidden="true" /> : null}
                    {loading ? "Signing in…" : "Sign in"}
                </button>
            </form>

            <p className="auth-switch">
                No account yet?{" "}
                <button type="button" className="auth-switch-link" onClick={switchMode}>
                    Create one
                </button>
            </p>
        </>
    );
}
