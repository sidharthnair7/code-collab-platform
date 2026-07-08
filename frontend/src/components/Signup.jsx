import { useState } from "react";
import { signup } from "../api";

const rules = [
    { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
    { id: "upper", label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { id: "number", label: "One number", test: (p) => /[0-9]/.test(p) },
    { id: "special", label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export default function Signup({ onSignup, switchMode }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showRules, setShowRules] = useState(false);

    const ruleResults = rules.map((r) => ({ ...r, passed: r.test(password) }));
    const allPassed = ruleResults.every((r) => r.passed);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!isValidEmail(email)) {
            setEmailError("Please enter a valid email address");
            return;
        }
        if (!allPassed) {
            setError("Please meet all password requirements.");
            return;
        }
        setError("");
        setEmailError("");
        setLoading(true);
        try {
            const data = await signup(email, password, firstName, lastName);
            onSignup(data.token);
        } catch {
            setError("Email already registered or signup failed. Try signing in.");
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

            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">Start collaborating in real time — it takes a minute</p>

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
                <div className="auth-row">
                    <div className="auth-field">
                        <label htmlFor="signup-first">First name</label>
                        <input
                            id="signup-first"
                            placeholder="Ada"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            autoComplete="given-name"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="signup-last">Last name</label>
                        <input
                            id="signup-last"
                            placeholder="Lovelace"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            autoComplete="family-name"
                            required
                        />
                    </div>
                </div>

                <div className="auth-field">
                    <label htmlFor="signup-email">Email</label>
                    <input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError("");
                        }}
                        onBlur={() => {
                            if (email && !isValidEmail(email)) setEmailError("Please enter a valid email");
                        }}
                        autoComplete="email"
                        className={emailError ? "has-error" : ""}
                        required
                    />
                    {emailError && <span className="auth-field-error">{emailError}</span>}
                </div>

                <div className="auth-field">
                    <label htmlFor="signup-password">Password</label>
                    <input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setShowRules(true)}
                        autoComplete="new-password"
                        className={password.length > 0 ? (allPassed ? "is-valid" : "has-error") : ""}
                        required
                    />
                    {showRules && (
                        <ul className="auth-rules">
                            {ruleResults.map((r) => (
                                <li key={r.id} className={r.passed ? "passed" : ""}>
                                    <span className="auth-rule-dot" aria-hidden="true" />
                                    {r.label}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button type="submit" className="auth-submit" disabled={loading || !allPassed}>
                    {loading ? <span className="auth-spinner" aria-hidden="true" /> : null}
                    {loading ? "Creating account…" : "Create account"}
                </button>
            </form>

            <p className="auth-switch">
                Already have an account?{" "}
                <button type="button" className="auth-switch-link" onClick={switchMode}>
                    Sign in
                </button>
            </p>
        </>
    );
}
