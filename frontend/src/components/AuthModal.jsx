import { useEffect } from "react";
import Login from "./Login";
import Signup from "./Signup";
import "../assets/Auth.css";

export default function AuthModal({ mode, onSwitchMode, onClose, onAuthed }) {
    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div
            className="auth-overlay"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="auth-card" role="dialog" aria-modal="true" aria-label={mode === "login" ? "Sign in" : "Create account"}>
                <button className="auth-close" onClick={onClose} aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                <div className="auth-body" key={mode}>
                    {mode === "login" ? (
                        <Login onLogin={onAuthed} switchMode={() => onSwitchMode("signup")} />
                    ) : (
                        <Signup onSignup={onAuthed} switchMode={() => onSwitchMode("login")} />
                    )}
                </div>
            </div>
        </div>
    );
}
