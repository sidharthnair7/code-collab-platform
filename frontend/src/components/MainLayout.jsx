import { useEffect, useState, useRef } from "react";
import {
    getFiles, getWorkspaces, createFile, createWorkspace,
    deleteFile, updateFileContent, getFilesByWorkspace, executeCode,
} from "../api";
import { connectWebSocket, sendCodeOperation, disconnectWebSocket } from "../websocket";
import Editor from "@monaco-editor/react";
import "../assets/Mainlayout.css";


const LANGUAGES = [
    { label: "Python",     languageId: 71  },
    { label: "Java",       languageId: 62  },
    { label: "JavaScript", languageId: 63 },
];

const FILE_ICONS = {
    js: "🟨", jsx: "⚛️", ts: "🔷", tsx: "⚛️",
    py: "🐍", java: "☕", css: "🎨", html: "🌐",
    json: "📋", md: "📝",
};

function getFileIcon(name) {
    if (!name) return "📄";
    const ext = name.split(".").pop()?.toLowerCase();
    return FILE_ICONS[ext] || "📄";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MainLayout({ token, username, onLogout }) {

    // ── State ──────────────────────────────────────────────────────────────
    const [workspaces,        setWorkspaces]        = useState([]);
    const [files,             setFiles]             = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [selectedFile,      setSelectedFile]      = useState(null);
    const [fileContent,       setFileContent]       = useState("");
    const [newWorkspaceName,  setNewWorkspaceName]  = useState("");
    const [newFileName,       setNewFileName]       = useState("");
    const [joinId,            setJoinId]            = useState("");
    const [copied,            setCopied]            = useState(null);
    const [isWsConnected,     setIsWsConnected]     = useState(false);

    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const [output,       setOutput]       = useState(null);
    const [isRunning,    setIsRunning]    = useState(false);
    const [outputOpen,   setOutputOpen]   = useState(false);

    // ── Refs ───────────────────────────────────────────────────────────────
    const editorRef        = useRef(null);
    const monacoRef        = useRef(null);
    const clientIdRef      = useRef(crypto.randomUUID());
    const usernameRef      = useRef(username);
    const lastSentRef      = useRef(null);
    const selectedFileRef  = useRef(null);
    const myColorRef       = useRef(`hsl(${Math.random() * 360}, 70%, 60%)`);
    const hasLoadedFileRef = useRef(false);


    const workspaceFiles = selectedWorkspace
        ? files.filter(f =>
            f.workspaceId === selectedWorkspace.id ||
            f.workspace?.id === selectedWorkspace.id
        )
        : [];

    const monacoLang = selectedLang.label === "JavaScript" ? "javascript"
        : selectedLang.label.toLowerCase();

    // ── Effects ────────────────────────────────────────────────────────────

    // Initial load
    useEffect(() => {
        loadWorkspaces();
        loadFiles();
    }, [token]);

    // Poll files when a workspace is selected
    useEffect(() => {
        if (!selectedWorkspace) return;
        loadFiles();
    }, [selectedWorkspace]);

    // Fetch file content when a file is selected
    useEffect(() => {
        if (!selectedFile) { setFileContent("");
            hasLoadedFileRef.current = false;
            return; }
        hasLoadedFileRef.current = false;
        (async () => {
            try {
                const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";
                const res = await fetch(`${base}/files/${selectedFile.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                setFileContent(data.content ?? "");
                hasLoadedFileRef.current = true;
            } catch {
                setFileContent(selectedFile.content ?? "");
                hasLoadedFileRef.current = true;
            }
        })();
    }, [selectedFile, token]);

    // Keep ref in sync
    useEffect(() => { selectedFileRef.current = selectedFile; }, [selectedFile]);

    // WebSocket lifecycle
    useEffect(() => {
        if (!selectedFile) {
            disconnectWebSocket();
            setIsWsConnected(false);
            return;
        }
        connectWebSocket(
            usernameRef.current,
            selectedFile.id,
            handleIncomingOperation,
            () => setIsWsConnected(true),
            () => setIsWsConnected(false)
        );
        return () => { disconnectWebSocket(); setIsWsConnected(false); };
    }, [selectedFile]);

    // Auto-save (owner only, 3 s debounce)
    useEffect(() => {
        if (!selectedFile || fileContent == null) return;
        if (!selectedWorkspace) return;
        if (selectedWorkspace.owner?.email !== username) return;
        if (!hasLoadedFileRef.current) return;
        const t = setTimeout(async () => {
            try { await updateFileContent(token, selectedFile.id, fileContent); }
            catch (err) { console.error("Auto-save failed:", err); }
        }, 3000);
        return () => clearTimeout(t);
    }, [fileContent, selectedFile, selectedWorkspace, username, token]);

    // ── WebSocket handlers ─────────────────────────────────────────────────

    function handleIncomingOperation(op) {
        if (!selectedFileRef.current) return;
        if (op.fileId    !== selectedFileRef.current.id) return;
        if (op.clientId  === clientIdRef.current) return;
        if (op.codeTextType === "CURSOR_MOVED") return;
        applyOperation(op);
    }

    function applyOperation({ codeTextType, codeText, position, length }) {
        setFileContent(prev => {
            const s = prev ?? "";
            switch (codeTextType) {
                case "TEXT_INSERTED": return s.slice(0, position) + (codeText ?? "") + s.slice(position);
                case "TEXT_DELETED":  return s.slice(0, position) + s.slice(position + (length ?? 0));
                case "TEXT_REPLACED": return s.slice(0, position) + (codeText ?? "") + s.slice(position + (length ?? 0));
                default: return s;
            }
        });
    }

    // ── Editor handlers ────────────────────────────────────────────────────

    function handleEditorDidMount(editor, monaco) {
        editorRef.current   = editor;
        monacoRef.current   = monaco;
        editor.onDidChangeCursorPosition(e => {
            if (!selectedFileRef.current) return;
            const model = editor.getModel();
            if (!model) return;
            sendCodeOperation({
                clientId:     clientIdRef.current,
                username:     usernameRef.current,
                fileId:       selectedFileRef.current.id,
                codeTextType: "CURSOR_MOVED",
                position:     model.getOffsetAt(e.position),
                color:        myColorRef.current,
            });
        });
    }

    function handleEditorChange(value, event) {
        setFileContent(value ?? "");
        if (!selectedFileRef.current) return;
        for (const change of event.changes) {
            let op = {
                clientId: clientIdRef.current,
                username: usernameRef.current,
                fileId:   selectedFileRef.current.id,
                color:    myColorRef.current,
                position: change.rangeOffset,
            };
            if (change.text === "") {
                op.codeTextType = "TEXT_DELETED";
                op.length       = change.rangeLength;
            } else if (change.rangeLength === 0) {
                op.codeTextType = "TEXT_INSERTED";
                op.codeText     = change.text;
            } else {
                op.codeTextType = "TEXT_REPLACED";
                op.codeText     = change.text;
                op.length       = change.rangeLength;
            }
            if (JSON.stringify(op) !== JSON.stringify(lastSentRef.current)) {
                sendCodeOperation(op);
                lastSentRef.current = op;
            }
        }
    }


    async function loadWorkspaces() {
        try { setWorkspaces(await getWorkspaces(token)); }
        catch (err) { console.error("loadWorkspaces:", err); }
    }

    async function loadFiles() {
        try {
            const data = selectedWorkspace
                ? await getFilesByWorkspace(token, selectedWorkspace.id)
                : await getFiles(token);
            setFiles(data);
        } catch (err) { console.error("loadFiles:", err); }
    }

    async function handleCreateWorkspace() {
        if (!newWorkspaceName.trim()) return;
        try {
            await createWorkspace(token, newWorkspaceName);
            setNewWorkspaceName("");
            await loadWorkspaces();
        } catch (err) { console.error("createWorkspace:", err); }
    }

    async function handleCreateFile() {
        if (!newFileName.trim() || !selectedWorkspace) return;
        try {
            await createFile(token, newFileName, selectedWorkspace.id);
            setNewFileName("");
            await loadFiles();
        } catch (err) { console.error("createFile:", err); }
    }

    async function handleDeleteFile(id) {
        try {
            await deleteFile(token, id);
            if (selectedFile?.id === id) setSelectedFile(null);
            await loadFiles();
        } catch (err) { console.error("deleteFile:", err); }
    }

    async function handleSaveFile() {
        if (!selectedFile) return;
        try { await updateFileContent(token, selectedFile.id, fileContent); }
        catch (err) { console.error("saveFile:", err); }
    }

    async function handleRun() {
        if (!selectedFile) return;
        setIsRunning(true);
        setOutput(null);
        setOutputOpen(true);
        try {
            const result = await executeCode(
                token,
                selectedLang.languageId,
                fileContent,
            );
            setOutput(result);
        } catch (err) {
            setOutput({ runtimeError: err.message, success: false });
        } finally {
            setIsRunning(false);
        }
    }

    async function handleJoinWorkspace() {
        if (!joinId.trim()) return;
        try {
            const { getWorkspaceById } = await import("../api");
            const ws = await getWorkspaceById(token, joinId.trim());
            setWorkspaces(prev => prev.find(w => w.id === ws.id) ? prev : [...prev, ws]);
            setSelectedWorkspace(ws);
            setJoinId("");
        } catch { alert("Workspace not found"); }
    }

    function copyId(id) {
        navigator.clipboard.writeText(String(id));
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
    }


    return (
        <div className="cc-app">

            <header className="cc-topbar">
                <div className="cc-topbar-left">
                    <div className="cc-logo-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M8 3L3 8l5 5M16 3l5 5-5 5M14 3l-4 18"
                                  stroke="#4fc3f7" strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span className="cc-logo-text">CodeCollab</span>
                    <span className="cc-breadcrumb-sep">/</span>
                    <span className="cc-breadcrumb-name">
                        {selectedWorkspace?.workSpaceName || "No workspace"}
                    </span>
                </div>

                <div className="cc-topbar-right">
                    <div className={`cc-ws-badge ${isWsConnected ? "connected" : "disconnected"}`}>
                        <div className={`cc-ws-dot ${isWsConnected ? "connected" : "disconnected"}`} />
                        {isWsConnected ? "Live" : "Offline"}
                    </div>

                    <div className="cc-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="4" stroke="#888" strokeWidth="2"/>
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#888"
                                  strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {username}
                    </div>

                    {selectedFile && (
                        <button className="cc-btn-save" onClick={handleSaveFile}>
                            Save
                        </button>
                    )}

                    <button className="cc-btn-signout" onClick={onLogout}>
                        Sign out
                    </button>
                </div>
            </header>

            {/* ── BODY ──────────────────────────────────────────────────── */}
            <div className="cc-body">

                {/* ── LEFT SIDEBAR ──────────────────────────────────────── */}
                <aside className="cc-sidebar">
                    <div className="cc-sidebar-scroll">

                        {/* Workspaces list */}
                        <div className="cc-side-section">
                            <div className="cc-side-label">Workspaces</div>
                            {workspaces.length === 0 && (
                                <p className="cc-side-empty">No workspaces yet</p>
                            )}
                            {workspaces.map(ws => (
                                <div
                                    key={ws.id}
                                    className={`cc-workspace-item ${selectedWorkspace?.id === ws.id ? "selected" : ""}`}
                                    onClick={() => setSelectedWorkspace(ws)}
                                >
                                    <span className="cc-workspace-name">{ws.workSpaceName}</span>
                                    <div className="cc-workspace-id-row">
                                        <span>ID: {ws.id}</span>
                                        <button
                                            className="cc-copy-btn"
                                            onClick={e => { e.stopPropagation(); copyId(ws.id); }}
                                        >
                                            {copied === ws.id ? "✓" : "copy"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cc-divider" />

                        {/* Create workspace */}
                        <div className="cc-input-row">
                            <input
                                className="cc-side-input"
                                placeholder="New workspace name"
                                value={newWorkspaceName}
                                onChange={e => setNewWorkspaceName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleCreateWorkspace()}
                            />
                            <button className="cc-create-btn blue" onClick={handleCreateWorkspace}>
                                + Create Workspace
                            </button>
                        </div>

                        <div className="cc-divider" />

                        {/* Join workspace */}
                        <div className="cc-input-row">
                            <input
                                className="cc-side-input"
                                placeholder="Join by workspace ID"
                                value={joinId}
                                onChange={e => setJoinId(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleJoinWorkspace()}
                            />
                            <button className="cc-create-btn purple" onClick={handleJoinWorkspace}>
                                Join Workspace
                            </button>
                        </div>

                    </div>
                </aside>

                {/* ── EDITOR AREA ───────────────────────────────────────── */}
                <main className="cc-editor-area">

                    {/* Tab bar */}
                    <div className="cc-tabbar">
                        <div className="cc-tabbar-left">
                            {selectedFile ? (
                                <div className="cc-tab active">
                                    <span>{getFileIcon(selectedFile.fileName)}</span>
                                    <span>{selectedFile.fileName}</span>
                                    <span className="cc-tab-dot">●</span>
                                </div>
                            ) : (
                                <div className="cc-no-file">No file open</div>
                            )}
                        </div>

                        {selectedFile && (
                            <div className="cc-tabbar-right">
                                <select
                                    className="cc-lang-select"
                                    value={selectedLang.languageId}
                                    onChange={e => setSelectedLang(
                                        LANGUAGES.find(l =>
                                            l.languageId === parseInt(e.target.value))
                                    )}
                                >
                                    {LANGUAGES.map(l => (
                                        <option key={l.languageId} value={l.languageId}>{l.label}</option>
                                    ))}
                                </select>

                                <button
                                    className="cc-btn-run"
                                    onClick={handleRun}
                                    disabled={isRunning}
                                >
                                    {isRunning ? "⏳ Running…" : "▶ Run"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Editor or empty state */}
                    {selectedFile ? (
                        <div className="cc-editor-body">

                            {/* Monaco */}
                            <div className="cc-editor-wrapper">
                                <Editor
                                    height="100%"
                                    language={monacoLang}
                                    value={fileContent}
                                    onChange={handleEditorChange}
                                    onMount={handleEditorDidMount}
                                    theme="vs-dark"
                                    options={{
                                        minimap:                  { enabled: true },
                                        fontSize:                 14,
                                        wordWrap:                 "on",
                                        automaticLayout:          true,
                                        cursorBlinking:           "smooth",
                                        cursorSmoothCaretAnimation: "on",
                                        renderLineHighlight:      "all",
                                        scrollBeyondLastLine:     false,
                                        padding:                  { top: 16, bottom: 16 },
                                        lineNumbers:              "on",
                                        glyphMargin:              true,
                                        folding:                  true,
                                        lineDecorationsWidth:     10,
                                        lineNumbersMinChars:      3,
                                        fontFamily:               "'JetBrains Mono', 'Fira Code', monospace",
                                    }}
                                />
                            </div>

                            {/* Output panel */}
                            {outputOpen && (
                                <div className="cc-output-panel">
                                    <div className="cc-output-header">
                                        <span className="cc-output-title">
                                            Output
                                            {output && (
                                                <span className={`cc-exit-badge ${output.success ? "success" : "error"}`}>
                                                    {output.success
                                                        ? "✓ exit 0"
                                                        : `✕ exit ${output.exitCode ?? 1}`}
                                                </span>
                                            )}
                                        </span>
                                        <button
                                            className="cc-output-close"
                                            onClick={() => setOutputOpen(false)}
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="cc-output-content">
                                        {isRunning && (
                                            <span className="cc-output-running">Running…</span>
                                        )}
                                        {output?.output && (
                                            <pre className="cc-output-stdout">{output.output}</pre>
                                        )}
                                        {output?.compileOutput && (
                                            <pre className="cc-output-compile">{output.compileOutput}</pre>
                                        )}
                                        {output?.runtimeError && (
                                            <pre className="cc-output-error">{output.runtimeError}</pre>
                                        )}
                                        {output &&
                                            !output.output &&
                                            !output.compileOutput &&
                                            !output.runtimeError && (
                                                <span className="cc-output-none">No output</span>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>

                    ) : (
                        <div className="cc-empty-editor">
                            <div className="cc-empty-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                    <path d="M8 3L3 8l5 5M16 3l5 5-5 5M14 3l-4 18"
                                          stroke="#333" strokeWidth="1.5"
                                          strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div className="cc-empty-text">Select a file to start editing</div>
                            <div className="cc-empty-hint">
                                {selectedWorkspace
                                    ? "Pick a file from the panel →"
                                    : "← Select a workspace first"}
                            </div>
                        </div>
                    )}
                </main>

                {/* ── RIGHT PANEL ───────────────────────────────────────── */}
                <aside className="cc-right-panel">
                    <div className="cc-right-header">
                        {selectedWorkspace
                            ? `Files — ${selectedWorkspace.workSpaceName}`
                            : "Files"}
                    </div>

                    {selectedWorkspace ? (
                        <>
                            <div className="cc-file-list">
                                {workspaceFiles.length === 0 && (
                                    <p className="cc-file-panel-empty">No files yet</p>
                                )}
                                {workspaceFiles.map(file => (
                                    <div
                                        key={file.id}
                                        className={`cc-file-item ${selectedFile?.id === file.id ? "selected" : ""}`}
                                        onClick={() => setSelectedFile(file)}
                                    >
                                        <span className="cc-file-icon">{getFileIcon(file.fileName)}</span>
                                        <span className="cc-file-name">{file.fileName}</span>
                                        <button
                                            className="cc-file-delete"
                                            onClick={e => { e.stopPropagation(); handleDeleteFile(file.id); }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="cc-file-create-row">
                                <input
                                    className="cc-side-input"
                                    placeholder="New file name"
                                    value={newFileName}
                                    onChange={e => setNewFileName(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleCreateFile()}
                                />
                                <button className="cc-create-btn green" onClick={handleCreateFile}>
                                    + Create File
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="cc-file-panel-empty">
                            Select a workspace<br/>to see files
                        </div>
                    )}
                </aside>

            </div>

            {/* ── STATUS BAR ────────────────────────────────────────────── */}
            <footer className="cc-statusbar">
                <div className="cc-statusbar-left">
                    <span className="cc-status-item">CodeCollab</span>
                    {selectedWorkspace && (
                        <span className="cc-status-item highlight">
                            {selectedWorkspace.workSpaceName}
                        </span>
                    )}
                </div>
                <div className="cc-statusbar-right">
                    {selectedFile && (
                        <span className="cc-status-item">
                            {getFileIcon(selectedFile.fileName)} {selectedFile.fileName}
                        </span>
                    )}
                    <span className="cc-status-item">
                        {isWsConnected ? "🟢 Live" : "⚫ Offline"}
                    </span>
                    <span className="cc-status-item">{username}</span>
                </div>
            </footer>

        </div>
    );
}