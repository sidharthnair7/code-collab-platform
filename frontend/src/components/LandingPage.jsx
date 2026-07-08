import { useEffect, useState } from "react";
import { GridScan } from "./GridScan";
import AuthModal from "./AuthModal";
import "../assets/LandingPage.css";

const GITHUB_URL = "https://github.com/sidharthnair7/code-collab-platform";

/* ── Icons (inline, stroke-based) ────────────────────────────────────────── */

const icons = {
    bolt: (
        <svg viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
    ),
    editor: (
        <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 10l-2.2 2L8 14M12 9.5L11 14.5M16 10l2.2 2L16 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    play: (
        <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M10 8.8l5 3.2-5 3.2V8.8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
    ),
    folder: (
        <svg viewBox="0 0 24 24" fill="none">
            <path d="M3 7.5V18a2 2 0 002 2h14a2 2 0 002-2V9.5a2 2 0 00-2-2h-8L9.5 5H5a2 2 0 00-2 2.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
    ),
    link: (
        <svg viewBox="0 0 24 24" fill="none">
            <path d="M10 14a4.5 4.5 0 006.4.4l3-3a4.5 4.5 0 00-6.4-6.4l-1.5 1.5M14 10a4.5 4.5 0 00-6.4-.4l-3 3a4.5 4.5 0 006.4 6.4l1.5-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    ),
    shield: (
        <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 11.8l2.2 2.2L15.5 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    github: (
        <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.72.5.1.68-.22.68-.49l-.01-1.73c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 015 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.6.69.49A10.05 10.05 0 0022 12.25C22 6.58 17.52 2 12 2z" />
        </svg>
    ),
};

/* ── Editor mockup (hero visual) ─────────────────────────────────────────── */

function EditorMockup() {
    return (
        <div className="lp-editor" aria-hidden="true">
            <div className="lp-editor-bar">
                <div className="lp-editor-dots">
                    <span /><span /><span />
                </div>
                <div className="lp-editor-tab">
                    <span className="lp-editor-tab-icon">🐍</span> merge_intervals.py
                </div>
                <div className="lp-editor-presence">
                    <div className="lp-avatars">
                        <span className="lp-avatar a1">S</span>
                        <span className="lp-avatar a2">M</span>
                        <span className="lp-avatar a3">D</span>
                    </div>
                    <span className="lp-live-badge"><span className="lp-live-dot" /> LIVE</span>
                </div>
            </div>

            <div className="lp-editor-code">
                <pre>
                    <code>
                        <span className="ln">1</span><span className="tok-c"># shared workspace · 3 editing</span>{"\n"}
                        <span className="ln">2</span><span className="tok-k">def</span> <span className="tok-f">merge_intervals</span><span className="tok-p">(</span>intervals<span className="tok-p">):</span>{"\n"}
                        <span className="ln">3</span>    intervals<span className="tok-p">.</span><span className="tok-f">sort</span><span className="tok-p">(</span>key<span className="tok-p">=</span><span className="tok-k">lambda</span> x<span className="tok-p">:</span> x<span className="tok-p">[</span><span className="tok-n">0</span><span className="tok-p">])</span>{"\n"}
                        <span className="ln">4</span>    merged <span className="tok-p">=</span> <span className="tok-p">[]</span>{"\n"}
                        <span className="ln">5</span>    <span className="tok-k">for</span> start<span className="tok-p">,</span> end <span className="tok-k">in</span> intervals<span className="tok-p">:</span>{"\n"}
                        <span className="ln">6</span>        <span className="tok-k">if</span> merged <span className="tok-k">and</span> start <span className="tok-p">&lt;=</span> merged<span className="tok-p">[-</span><span className="tok-n">1</span><span className="tok-p">][</span><span className="tok-n">1</span><span className="tok-p">]:</span>{"\n"}
                        <span className="ln">7</span>            merged<span className="tok-p">[-</span><span className="tok-n">1</span><span className="tok-p">][</span><span className="tok-n">1</span><span className="tok-p">]</span> <span className="tok-p">=</span> <span className="tok-f">max</span><span className="tok-p">(</span>merged<span className="tok-p">[-</span><span className="tok-n">1</span><span className="tok-p">][</span><span className="tok-n">1</span><span className="tok-p">],</span> end<span className="tok-p">)</span>{"\n"}
                        <span className="ln">8</span>        <span className="tok-k">else</span><span className="tok-p">:</span>{"\n"}
                        <span className="ln">9</span>            merged<span className="tok-p">.</span><span className="tok-f">append</span><span className="tok-p">([</span>start<span className="tok-p">,</span> end<span className="tok-p">])</span>{"\n"}
                        <span className="ln">10</span>    <span className="tok-k">return</span> merged<span className="lp-caret" />
                    </code>
                </pre>

                <div className="lp-cursor cursor-maya">
                    <span className="lp-cursor-flag">Maya</span>
                </div>
                <div className="lp-cursor cursor-dev">
                    <span className="lp-cursor-flag">Dev</span>
                </div>
            </div>

            <div className="lp-editor-output">
                <span className="lp-output-cmd">▶ run · python</span>
                <span className="lp-output-result">[[1, 6], [8, 10]]</span>
                <span className="lp-output-ok">✓ 128 ms</span>
            </div>
        </div>
    );
}

/* ── Content data ────────────────────────────────────────────────────────── */

const features = [
    {
        icon: icons.bolt,
        title: "Live collaborative editing",
        text: "Every keystroke syncs instantly over STOMP WebSockets. See teammates' cursors and edits appear in real time, with named tags in their own colors.",
    },
    {
        icon: icons.editor,
        title: "A VS Code-grade editor",
        text: "Built on Monaco — the engine behind VS Code — with syntax highlighting, smart indentation, and the keybindings your fingers already know.",
    },
    {
        icon: icons.play,
        title: "Run code in the browser",
        text: "Execute Python, Java, and JavaScript in isolated sandboxes and see stdout, errors, and timing without ever leaving the editor.",
    },
    {
        icon: icons.folder,
        title: "Workspaces & files",
        text: "Group work into workspaces, create and rename files inline, and switch between them with state kept in sync for everyone.",
    },
    {
        icon: icons.link,
        title: "Share with one ID",
        text: "No invite emails, no setup. Send a workspace ID and a collaborator joins your session in seconds, ready to type.",
    },
    {
        icon: icons.shield,
        title: "Secure by default",
        text: "Stateless JWT authentication and hashed credentials guard every REST call and socket connection behind Spring Security.",
    },
];

const steps = [
    {
        num: "01",
        title: "Create a workspace",
        text: "Sign up, name your workspace, and add your first file. Your session is live immediately.",
    },
    {
        num: "02",
        title: "Invite your team",
        text: "Copy the workspace ID and share it anywhere. Collaborators join instantly — no downloads, no config.",
    },
    {
        num: "03",
        title: "Code together",
        text: "Edit side by side with live cursors, then run your code and share the output with the whole room.",
    },
];

const stack = [
    "React 19", "Vite", "Monaco Editor", "STOMP over WebSocket",
    "Spring Boot", "Spring Security · JWT", "PostgreSQL", "Docker",
];

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function LandingPage({ onLogin }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState("login");
    const [scrolled, setScrolled] = useState(false);

    function openAuth(mode) {
        setAuthMode(mode);
        setModalOpen(true);
    }

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Reveal-on-scroll for sections
    useEffect(() => {
        const els = document.querySelectorAll("[data-reveal]");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            els.forEach((el) => el.classList.add("is-visible"));
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );
        els.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="lp">
            {/* ── Nav ── */}
            <nav className={`lp-nav ${scrolled ? "is-scrolled" : ""}`}>
                <div className="lp-nav-inner">
                    <a className="lp-brand" href="#top" aria-label="CodeCollab home">
                        <span className="lp-brand-mark">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                <path d="M8 3L3 8l5 5M16 3l5 5-5 5M14 3l-4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        CodeCollab
                    </a>

                    <div className="lp-nav-links">
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How it works</a>
                        <a href="#stack">Stack</a>
                    </div>

                    <div className="lp-nav-actions">
                        <a className="lp-nav-github" href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub repository">
                            {icons.github}
                        </a>
                        <button className="lp-btn ghost" onClick={() => openAuth("login")}>Sign in</button>
                        <button className="lp-btn primary" onClick={() => openAuth("signup")}>Get started</button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <header className="lp-hero" id="top">
                <div className="lp-hero-bg">
                    <GridScan scanDuration={2.4} scanDelay={3.2} noiseIntensity={0.006} />
                </div>
                <div className="lp-hero-vignette" />

                <div className="lp-hero-inner">
                    <div className="lp-hero-copy">
                        <span className="lp-pill">
                            <span className="lp-pill-dot" /> Real-time sync over WebSockets
                        </span>
                        <h1>
                            Code together.
                            <br />
                            <span className="lp-gradient-text">Ship faster.</span>
                        </h1>
                        <p>
                            A real-time collaborative editor with live cursors, shared workspaces,
                            and in-browser code execution — powered by the engine behind VS&nbsp;Code.
                        </p>
                        <div className="lp-hero-ctas">
                            <button className="lp-btn primary lg" onClick={() => openAuth("signup")}>
                                Start collaborating
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12h14m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button className="lp-btn ghost lg" onClick={() => openAuth("login")}>Sign in</button>
                        </div>
                        <span className="lp-hero-note">Python · Java · JavaScript — runs right in your browser</span>
                    </div>

                    <div className="lp-hero-visual">
                        <EditorMockup />
                    </div>
                </div>
            </header>

            {/* ── Fact strip ── */}
            <section className="lp-strip" data-reveal>
                <div className="lp-strip-inner">
                    <div className="lp-fact">
                        <strong>Real-time</strong>
                        <span>edits &amp; cursors over STOMP</span>
                    </div>
                    <div className="lp-fact">
                        <strong>3 runtimes</strong>
                        <span>Python, Java, JavaScript</span>
                    </div>
                    <div className="lp-fact">
                        <strong>Monaco</strong>
                        <span>the editor behind VS Code</span>
                    </div>
                    <div className="lp-fact">
                        <strong>JWT</strong>
                        <span>stateless, secured sessions</span>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="lp-section" id="features">
                <div className="lp-section-head" data-reveal>
                    <span className="lp-eyebrow">Features</span>
                    <h2>Everything a pair-programming session needs</h2>
                    <p>From the first keystroke to the final run — built for tight feedback loops.</p>
                </div>
                <div className="lp-grid" data-reveal>
                    {features.map((f) => (
                        <article className="lp-card" key={f.title}>
                            <div className="lp-card-icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="lp-section" id="how-it-works">
                <div className="lp-section-head" data-reveal>
                    <span className="lp-eyebrow">How it works</span>
                    <h2>From zero to pairing in under a minute</h2>
                </div>
                <div className="lp-steps" data-reveal>
                    {steps.map((s) => (
                        <div className="lp-step" key={s.num}>
                            <span className="lp-step-num">{s.num}</span>
                            <h3>{s.title}</h3>
                            <p>{s.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Stack ── */}
            <section className="lp-section" id="stack">
                <div className="lp-section-head" data-reveal>
                    <span className="lp-eyebrow">Under the hood</span>
                    <h2>A production-grade stack</h2>
                    <p>Full-stack, end to end: a React front end talking to a Spring Boot API over REST and WebSockets.</p>
                </div>
                <div className="lp-chips" data-reveal>
                    {stack.map((item) => (
                        <span className="lp-chip" key={item}>{item}</span>
                    ))}
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="lp-cta" data-reveal>
                <div className="lp-cta-card">
                    <h2>Ready to code together?</h2>
                    <p>Create a workspace and share the ID — your first session is one click away.</p>
                    <div className="lp-cta-actions">
                        <button className="lp-btn primary lg" onClick={() => openAuth("signup")}>
                            Create free account
                        </button>
                        <a className="lp-btn ghost lg" href={GITHUB_URL} target="_blank" rel="noreferrer">
                            {icons.github}
                            View source
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-footer-brand">
                        <span className="lp-brand-mark">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                <path d="M8 3L3 8l5 5M16 3l5 5-5 5M14 3l-4 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        <span>CodeCollab — built by Sidharth Nair</span>
                    </div>
                    <div className="lp-footer-links">
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How it works</a>
                        <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
                    </div>
                </div>
            </footer>

            {modalOpen && (
                <AuthModal
                    mode={authMode}
                    onSwitchMode={setAuthMode}
                    onClose={() => setModalOpen(false)}
                    onAuthed={onLogin}
                />
            )}
        </div>
    );
}
