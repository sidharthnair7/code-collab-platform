import { useState } from "react";
import { signup } from "../api";

export default function Signup({ onSignup, switchMode }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await signup(email, password, firstName, lastName);
            onSignup(data.token);
        } catch (err) {
            setError("Email already registered or signup failed. Try logging in.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.grid} />
            <div style={styles.blobBlue} />
            <div style={styles.blobPurple} />

            <div style={styles.card}>
                <div style={styles.logoRow}>
                    <div style={styles.logoIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M8 3L3 8l5 5M16 3l5 5-5 5M14 3l-4 18" stroke="#4fc3f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span style={styles.logoText}>CodeCollab</span>
                </div>

                <h1 style={styles.title}>Create account</h1>
                <p style={styles.subtitle}>Start collaborating in real time</p>

                {error && (
                    <div style={styles.errorBox}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{marginRight: 6, flexShrink: 0}}>
                            <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="2"/>
                            <path d="M12 8v4M12 16h.01" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.row}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>First Name</label>
                            <input placeholder="John" value={firstName}
                                   onChange={(e) => setFirstName(e.target.value)} required style={styles.input}
                                   onFocus={e => e.target.style.borderColor = "#4fc3f7"}
                                   onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Last Name</label>
                            <input placeholder="Doe" value={lastName}
                                   onChange={(e) => setLastName(e.target.value)} required style={styles.input}
                                   onFocus={e => e.target.style.borderColor = "#4fc3f7"}
                                   onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                        </div>
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Email</label>
                        <input type="email" placeholder="you@example.com" value={email}
                               onChange={(e) => setEmail(e.target.value)} required style={styles.input}
                               onFocus={e => e.target.style.borderColor = "#4fc3f7"}
                               onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                    </div>

                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Password</label>
                        <input type="password" placeholder="••••••••" value={password}
                               onChange={(e) => setPassword(e.target.value)} required style={styles.input}
                               onFocus={e => e.target.style.borderColor = "#4fc3f7"}
                               onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                    </div>

                    <button type="submit" disabled={loading}
                            style={{...styles.button, opacity: loading ? 0.7 : 1}}
                            onMouseEnter={e => !loading && (e.target.style.background = "#29b6f6")}
                            onMouseLeave={e => e.target.style.background = "#4fc3f7"}>
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p style={styles.switchText}>
                    Already have an account?{" "}
                    <span onClick={switchMode} style={styles.switchLink}>Sign in</span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    page: { minHeight: "100vh", width: "100vw", background: "#0d0d0d", display: "flex",
        alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" },
    grid: { position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "40px 40px", pointerEvents: "none" },
    blobBlue: { position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(79,195,247,0.08) 0%, transparent 70%)",
        top: "10%", right: "10%", pointerEvents: "none" },
    blobPurple: { position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,77,255,0.07) 0%, transparent 70%)",
        bottom: "15%", left: "5%", pointerEvents: "none" },
    card: { position: "relative", zIndex: 1, background: "rgba(18,18,18,0.95)",
        border: "1px solid #1e1e1e", borderRadius: 16, padding: "2.5rem", width: "100%", maxWidth: 420,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.6)" },
    logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: "2rem" },
    logoIcon: { width: 36, height: 36, background: "rgba(79,195,247,0.1)",
        border: "1px solid rgba(79,195,247,0.2)", borderRadius: 8, display: "flex",
        alignItems: "center", justifyContent: "center" },
    logoText: { color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" },
    title: { color: "#fff", fontSize: 24, fontWeight: 700, margin: "0 0 6px 0", letterSpacing: "-0.03em" },
    subtitle: { color: "#555", fontSize: 13, margin: "0 0 1.5rem 0" },
    errorBox: { display: "flex", alignItems: "center", background: "rgba(248,113,113,0.08)",
        border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 12px",
        color: "#f87171", fontSize: 13, marginBottom: "1rem" },
    form: { display: "flex", flexDirection: "column", gap: "1rem" },
    row: { display: "flex", gap: "0.75rem" },
    fieldGroup: { display: "flex", flexDirection: "column", gap: 6, flex: 1 },
    label: { color: "#888", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" },
    input: { background: "#141414", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 14px",
        color: "#fff", fontSize: 14, outline: "none", transition: "border-color 0.2s",
        fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
    button: { marginTop: 8, background: "#4fc3f7", color: "#000", border: "none", borderRadius: 8,
        padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background 0.2s",
        fontFamily: "inherit", letterSpacing: "-0.01em" },
    switchText: { marginTop: "1.5rem", textAlign: "center", color: "#555", fontSize: 13 },
    switchLink: { color: "#4fc3f7", cursor: "pointer", fontWeight: 600 },
};