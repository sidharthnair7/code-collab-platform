import { useEffect, useState, useRef } from "react";
import { getFiles, getWorkspaces, createFile, createWorkspace, deleteFile, updateFileContent, getFilesByWorkspace } from "../api";
import { connectWebSocket, sendCodeOperation, disconnectWebSocket } from "../websocket";
import Editor from "@monaco-editor/react";

const S = {
    app: {
        display: "flex", flexDirection: "column", height: "100vh", width: "100vw",
        background: "#0d0d0d", fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        color: "#cdd6f4", overflow: "hidden",
    },
    // TOP BAR
    topBar: {
        height: 48, minHeight: 48, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 16px",
        background: "#111111", borderBottom: "1px solid #1e1e2e",
        zIndex: 100,
    },
    topBarLeft: { display: "flex", alignItems: "center", gap: 10 },
    logoIcon: {
        width: 28, height: 28, background: "rgba(79,195,247,0.12)",
        border: "1px solid rgba(79,195,247,0.25)", borderRadius: 6,
        display: "flex", alignItems: "center", justifyContent: "center",
    },
    logoText: { color: "#cdd6f4", fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em" },
    topBarRight: { display: "flex", alignItems: "center", gap: 8 },
    userBadge: {
        display: "flex", alignItems: "center", gap: 6, padding: "4px 10px",
        background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e",
        borderRadius: 6, fontSize: 12, color: "#888",
    },
    wsBadge: (connected) => ({
        display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
        background: connected ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${connected ? "rgba(74,222,128,0.2)" : "#1e1e2e"}`,
        borderRadius: 6, fontSize: 11, color: connected ? "#4ade80" : "#555",
        fontWeight: 600,
    }),
    wsDot: (connected) => ({
        width: 6, height: 6, borderRadius: "50%",
        background: connected ? "#4ade80" : "#333",
        boxShadow: connected ? "0 0 6px #4ade80" : "none",
    }),
    signOutBtn: {
        padding: "5px 12px", background: "transparent", color: "#555",
        border: "1px solid #1e1e2e", borderRadius: 6, cursor: "pointer",
        fontSize: 12, fontFamily: "inherit",
    },
    saveBtn: {
        padding: "5px 14px", background: "#4fc3f7", color: "#000",
        border: "none", borderRadius: 6, cursor: "pointer",
        fontSize: 12, fontWeight: 700, fontFamily: "inherit",
    },

    // BODY
    body: { display: "flex", flex: 1, overflow: "hidden" },

    // LEFT SIDEBAR
    sidebar: {
        width: 240, minWidth: 240, display: "flex", flexDirection: "column",
        background: "#111111", borderRight: "1px solid #1e1e2e", overflow: "hidden",
    },
    sideSection: { padding: "12px 12px 8px" },
    sideLabel: {
        fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: "0.1em",
        textTransform: "uppercase", marginBottom: 8, padding: "0 4px",
    },
    workspaceItem: (selected) => ({
        padding: "8px 10px", borderRadius: 6, cursor: "pointer", marginBottom: 2,
        background: selected ? "rgba(79,195,247,0.1)" : "transparent",
        border: `1px solid ${selected ? "rgba(79,195,247,0.2)" : "transparent"}`,
        transition: "all 0.15s",
    }),
    workspaceName: (selected) => ({
        fontSize: 12, color: selected ? "#4fc3f7" : "#888", fontWeight: selected ? 600 : 400,
        display: "block", marginBottom: 2,
    }),
    workspaceId: {
        fontSize: 10, color: "#444", display: "flex", alignItems: "center", gap: 4,
    },
    copyBtn: {
        fontSize: 10, color: "#4fc3f7", cursor: "pointer", background: "none",
        border: "none", padding: 0, fontFamily: "inherit",
    },
    divider: { height: 1, background: "#1e1e2e", margin: "4px 12px" },
    inputRow: { padding: "8px 12px" },
    sideInput: {
        width: "100%", padding: "7px 10px", background: "#0d0d0d",
        border: "1px solid #1e1e2e", borderRadius: 6, color: "#cdd6f4",
        fontSize: 12, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
        marginBottom: 6,
    },
    createBtn: (color) => ({
        width: "100%", padding: "7px", background: color || "#4fc3f7",
        color: color ? "#fff" : "#000", border: "none", borderRadius: 6,
        cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit",
    }),

    // EDITOR
    editorArea: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    tabBar: {
        height: 36, minHeight: 36, display: "flex", alignItems: "center",
        background: "#0d0d0d", borderBottom: "1px solid #1e1e2e", paddingLeft: 0,
        overflowX: "auto",
    },
    tab: (active) => ({
        display: "flex", alignItems: "center", gap: 6,
        padding: "0 16px", height: "100%", fontSize: 12,
        color: active ? "#cdd6f4" : "#555", cursor: "pointer",
        background: active ? "#1e1e2e" : "transparent",
        borderRight: "1px solid #1e1e2e",
        borderBottom: active ? "1px solid #4fc3f7" : "1px solid transparent",
        whiteSpace: "nowrap", userSelect: "none",
    }),
    emptyEditor: {
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", background: "#0d0d0d", color: "#333",
        gap: 12,
    },
    emptyIcon: { opacity: 0.3 },
    emptyText: { fontSize: 13, color: "#444" },

    // RIGHT SIDEBAR
    rightPanel: {
        width: 220, minWidth: 220, display: "flex", flexDirection: "column",
        background: "#111111", borderLeft: "1px solid #1e1e2e", overflow: "hidden",
    },
    rightHeader: {
        padding: "10px 12px", borderBottom: "1px solid #1e1e2e",
        fontSize: 10, fontWeight: 700, color: "#444",
        letterSpacing: "0.1em", textTransform: "uppercase",
    },
    fileItem: (selected) => ({
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 10px", margin: "2px 6px", borderRadius: 5, cursor: "pointer",
        background: selected ? "rgba(79,195,247,0.1)" : "transparent",
        border: `1px solid ${selected ? "rgba(79,195,247,0.15)" : "transparent"}`,
        transition: "all 0.15s",
    }),
    fileName: (selected) => ({
        fontSize: 12, color: selected ? "#4fc3f7" : "#888",
        fontWeight: selected ? 600 : 400, flex: 1, overflow: "hidden",
        textOverflow: "ellipsis", whiteSpace: "nowrap",
    }),
    deleteBtn: {
        width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: 4, color: "#ef4444", cursor: "pointer", fontSize: 10,
        flexShrink: 0, fontFamily: "inherit",
    },
    // STATUS BAR
    statusBar: {
        height: 22, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 12px", background: "#0a0a0a", borderTop: "1px solid #1e1e2e",
        fontSize: 10, color: "#444",
    },
};

export default function MainLayout({ token, username, onLogout }) {
    const [joinId, setJoinId] = useState("");
    const [workspaces, setWorkspaces] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState("");
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [newFileName, setNewFileName] = useState("");
    const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
    const [otherCursors, setOtherCursors] = useState({});
    const [copied, setCopied] = useState(null);

    const myColorRef = useRef(`hsl(${Math.random() * 360}, 70%, 60%)`);
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const clientIdRef = useRef(crypto.randomUUID());
    const usernameRef = useRef(username);
    const lastSentRef = useRef(null);
    const selectedFileRef = useRef(null);

    const workspaceFiles = selectedWorkspace
        ? files.filter(f => f.workspaceId === selectedWorkspace.id || f.workspace?.id === selectedWorkspace.id)
        : [];

    useEffect(() => { loadWorkspaces(); loadFiles(); }, [token]);

    useEffect(() => {
        if (!selectedWorkspace) return;
        const interval = setInterval(() => { loadFiles(); }, 3000);
        return () => clearInterval(interval);
    }, [selectedWorkspace]);

    useEffect(() => { if (selectedWorkspace) loadFiles(); }, [selectedWorkspace]);

    useEffect(() => {
        if (!selectedFile) { setFileContent(""); return; }
        const fetchContent = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"}/files/${selectedFile.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                setFileContent(data.content ?? "");
            } catch { setFileContent(selectedFile.content ?? ""); }
        };
        fetchContent();
    }, [selectedFile]);

    useEffect(() => { selectedFileRef.current = selectedFile; }, [selectedFile]);

    useEffect(() => {
        if (!selectedFile) { disconnectWebSocket(); setIsWebSocketConnected(false); return; }
        connectWebSocket(usernameRef.current, selectedFile.id, handleIncomingCodeOperation);
        setIsWebSocketConnected(true);
        return () => { disconnectWebSocket(); setIsWebSocketConnected(false); };
    }, [selectedFile]);

    useEffect(() => {
        if (!selectedFile || fileContent === null || fileContent === undefined) return;
        if (!selectedWorkspace) return;
        const isOwner = selectedWorkspace.owner?.email === username;
        if (!isOwner) return;
        const saveTimer = setTimeout(async () => {
            try { await updateFileContent(token, selectedFile.id, fileContent); }
            catch (err) { console.error("Auto-save failed:", err); }
        }, 3000);
        return () => clearTimeout(saveTimer);
    }, [fileContent]);

    useEffect(() => {
        if (!selectedFile || !selectedWorkspace) return;
        const isOwner = selectedWorkspace.owner?.email === username;
        if (isOwner) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"}/files/${selectedFile.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                setFileContent(data.content ?? "");
            } catch (err) { console.error("Poll content failed:", err); }
        }, 3000);
        return () => clearInterval(interval);
    }, [selectedFile, selectedWorkspace]);

    function handleIncomingCodeOperation(operation) {
        if (!selectedFileRef.current) return;
        if (operation.fileId !== selectedFileRef.current.id) return;
        if (operation.clientId === clientIdRef.current) return;
        if (operation.codeTextType === "CURSOR_MOVED") {
            setOtherCursors(prev => ({
                ...prev,
                [operation.clientId]: { position: operation.position, color: operation.color, username: operation.username }
            }));
            return;
        }
        applyOperation(operation);
    }

    function applyOperation(operation) {
        const { codeTextType, codeText, position, length } = operation;
        setFileContent((prev) => {
            const safeContent = prev ?? "";
            switch (codeTextType) {
                case "TEXT_INSERTED": return safeContent.slice(0, position) + (codeText ?? "") + safeContent.slice(position);
                case "TEXT_DELETED": return safeContent.slice(0, position) + safeContent.slice(position + (length ?? 0));
                case "TEXT_REPLACED": return safeContent.slice(0, position) + (codeText ?? "") + safeContent.slice(position + (length ?? 0));
                default: return safeContent;
            }
        });
    }

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;
        editor.onDidChangeCursorPosition((e) => {
            if (!selectedFileRef.current) return;
            const model = editor.getModel();
            if (!model) return;
            const offset = model.getOffsetAt(e.position);
            const op = {
                clientId: clientIdRef.current, username: usernameRef.current,
                fileId: selectedFileRef.current.id, codeTextType: "CURSOR_MOVED",
                position: offset, color: myColorRef.current,
            };
            sendCodeOperation(op);
        });
    }

    function handleEditorChange(value, event) {
        setFileContent(value ?? "");
        if (!selectedFileRef.current) return;
        const changes = event.changes;
        for (const change of changes) {
            const op = {
                clientId: clientIdRef.current, username: usernameRef.current,
                fileId: selectedFileRef.current.id, color: myColorRef.current,
                position: change.rangeOffset,
            };
            if (change.text === "") {
                op.codeTextType = "TEXT_DELETED";
                op.length = change.rangeLength;
            } else if (change.rangeLength === 0) {
                op.codeTextType = "TEXT_INSERTED";
                op.codeText = change.text;
            } else {
                op.codeTextType = "TEXT_REPLACED";
                op.codeText = change.text;
                op.length = change.rangeLength;
            }
            if (JSON.stringify(op) !== JSON.stringify(lastSentRef.current)) {
                sendCodeOperation(op);
                lastSentRef.current = op;
            }
        }
    }

    async function loadWorkspaces() {
        try { const data = await getWorkspaces(token); setWorkspaces(data); }
        catch (err) { console.error("Failed to load workspaces:", err); }
    }

    async function loadFiles() {
        try {
            if (selectedWorkspace) {
                const data = await getFilesByWorkspace(token, selectedWorkspace.id);
                setFiles(data);
            } else {
                const data = await getFiles(token);
                setFiles(data);
            }
        } catch (err) { console.error("Failed to load files:", err); }
    }

    async function handleCreateWorkspace() {
        if (!newWorkspaceName.trim()) return;
        try {
            await createWorkspace(token, newWorkspaceName);
            setNewWorkspaceName("");
            await loadWorkspaces();
        } catch (err) { console.error("Failed to create workspace:", err); }
    }

    async function handleCreateFile() {
        if (!newFileName.trim() || !selectedWorkspace) return;
        try {
            await createFile(token, newFileName, selectedWorkspace.id);
            setNewFileName("");
            await loadFiles();
        } catch (err) { console.error("Failed to create file:", err); }
    }

    async function handleDeleteFile(id) {
        try {
            await deleteFile(token, id);
            if (selectedFile?.id === id) setSelectedFile(null);
            await loadFiles();
        } catch (err) { console.error("Failed to delete file:", err); }
    }

    async function handleSaveFile() {
        if (!selectedFile) return;
        try { await updateFileContent(token, selectedFile.id, fileContent); }
        catch (err) { console.error("Save failed:", err); }
    }

    function copyId(id) {
        navigator.clipboard.writeText(String(id));
        setCopied(id);
        setTimeout(() => setCopied(null), 1500);
    }

    const getFileIcon = (name) => {
        if (!name) return "📄";
        const ext = name.split(".").pop()?.toLowerCase();
        const icons = { js: "🟨", jsx: "⚛️", ts: "🔷", tsx: "⚛️", py: "🐍", java: "☕", css: "🎨", html: "🌐", json: "📋", md: "📝" };
        return icons[ext] || "📄";
    };

    return (
        <div style={S.app}>
            {/* TOP BAR */}
            <div style={S.topBar}>
                <div style={S.topBarLeft}>
                    <div style={S.logoIcon}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M8 3L3 8l5 5M16 3l5 5-5 5M14 3l-4 18" stroke="#4fc3f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span style={S.logoText}>CodeCollab</span>
                    <span style={{ color: "#333", fontSize: 12, marginLeft: 4 }}>/</span>
                    <span style={{ color: "#555", fontSize: 12 }}>{selectedWorkspace?.workSpaceName || "No workspace"}</span>
                </div>
                <div style={S.topBarRight}>
                    <div style={S.wsBadge(isWebSocketConnected)}>
                        <div style={S.wsDot(isWebSocketConnected)} />
                        {isWebSocketConnected ? "Live" : "Offline"}
                    </div>
                    <div style={S.userBadge}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="4" stroke="#888" strokeWidth="2"/>
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        {username}
                    </div>
                    {selectedFile && (
                        <button onClick={handleSaveFile} style={S.saveBtn}>Save</button>
                    )}
                    <button onClick={onLogout} style={S.signOutBtn}>Sign out</button>
                </div>
            </div>

            {/* BODY */}
            <div style={S.body}>
                {/* LEFT SIDEBAR */}
                <div style={S.sidebar}>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        <div style={S.sideSection}>
                            <div style={S.sideLabel}>Workspaces</div>
                            {workspaces.length === 0 && (
                                <div style={{ fontSize: 11, color: "#333", padding: "4px" }}>No workspaces yet</div>
                            )}
                            {workspaces.map(ws => (
                                <div key={ws.id} onClick={() => setSelectedWorkspace(ws)}
                                     style={S.workspaceItem(selectedWorkspace?.id === ws.id)}>
                                    <span style={S.workspaceName(selectedWorkspace?.id === ws.id)}>
                                        {ws.workSpaceName}
                                    </span>
                                    <div style={S.workspaceId}>
                                        <span>ID: {ws.id}</span>
                                        <button onClick={(e) => { e.stopPropagation(); copyId(ws.id); }}
                                                style={S.copyBtn}>
                                            {copied === ws.id ? "✓" : "copy"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={S.divider} />

                        <div style={S.inputRow}>
                            <input value={newWorkspaceName} onChange={e => setNewWorkspaceName(e.target.value)}
                                   onKeyDown={e => e.key === "Enter" && handleCreateWorkspace()}
                                   placeholder="New workspace name"
                                   style={S.sideInput} />
                            <button onClick={handleCreateWorkspace} style={S.createBtn("#4fc3f7")}>
                                + Create Workspace
                            </button>
                        </div>

                        <div style={S.divider} />

                        <div style={S.inputRow}>
                            <input value={joinId} onChange={e => setJoinId(e.target.value)}
                                   placeholder="Join by workspace ID"
                                   style={S.sideInput} />
                            <button onClick={async () => {
                                if (!joinId.trim()) return;
                                try {
                                    const { getWorkspaceById } = await import("../api");
                                    const ws = await getWorkspaceById(token, parseInt(joinId));
                                    setWorkspaces(prev => prev.find(w => w.id === ws.id) ? prev : [...prev, ws]);
                                    setSelectedWorkspace(ws);
                                    setJoinId("");
                                } catch (err) { alert("Workspace not found"); }
                            }} style={S.createBtn("#7c3aed")}>
                                Join Workspace
                            </button>
                        </div>
                    </div>
                </div>

                {/* EDITOR AREA */}
                <div style={S.editorArea}>
                    {/* TAB BAR */}
                    <div style={S.tabBar}>
                        {selectedFile ? (
                            <div style={S.tab(true)}>
                                <span>{getFileIcon(selectedFile.fileName)}</span>
                                <span>{selectedFile.fileName}</span>
                                <span style={{ fontSize: 10, color: "#333", marginLeft: 2 }}>●</span>
                            </div>
                        ) : (
                            <div style={{ padding: "0 16px", fontSize: 12, color: "#333", display: "flex", alignItems: "center", height: "100%" }}>
                                No file open
                            </div>
                        )}
                    </div>

                    {selectedFile ? (
                        <div style={{ flex: 1, position: "relative" }}>
                            <Editor
                                height="100%"
                                language="javascript"
                                value={fileContent}
                                onChange={handleEditorChange}
                                onMount={handleEditorDidMount}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: true }, fontSize: 14, wordWrap: "on",
                                    automaticLayout: true, cursorBlinking: "smooth",
                                    cursorSmoothCaretAnimation: "on", renderLineHighlight: "all",
                                    scrollBeyondLastLine: false, padding: { top: 16, bottom: 16 },
                                    lineNumbers: "on", glyphMargin: true, folding: true,
                                    lineDecorationsWidth: 10, lineNumbersMinChars: 3,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                }}
                            />
                        </div>
                    ) : (
                        <div style={S.emptyEditor}>
                            <div style={S.emptyIcon}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                    <path d="M8 3L3 8l5 5M16 3l5 5-5 5M14 3l-4 18" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <div style={S.emptyText}>Select a file to start editing</div>
                            <div style={{ fontSize: 11, color: "#333" }}>
                                {selectedWorkspace ? "Pick a file from the panel →" : "← Select a workspace first"}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL - FILES */}
                <div style={S.rightPanel}>
                    <div style={S.rightHeader}>
                        {selectedWorkspace ? `Files — ${selectedWorkspace.workSpaceName}` : "Files"}
                    </div>

                    {selectedWorkspace ? (
                        <>
                            <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
                                {workspaceFiles.length === 0 && (
                                    <div style={{ fontSize: 11, color: "#333", padding: "8px 16px" }}>No files yet</div>
                                )}
                                {workspaceFiles.map(file => (
                                    <div key={file.id} style={S.fileItem(selectedFile?.id === file.id)}
                                         onClick={() => setSelectedFile(file)}>
                                        <span style={{ marginRight: 6, fontSize: 12 }}>{getFileIcon(file.fileName)}</span>
                                        <span style={S.fileName(selectedFile?.id === file.id)}>{file.fileName}</span>
                                        <button onClick={e => { e.stopPropagation(); handleDeleteFile(file.id); }}
                                                style={S.deleteBtn}>✕</button>
                                    </div>
                                ))}
                            </div>

                            <div style={{ padding: "8px 12px", borderTop: "1px solid #1e1e2e" }}>
                                <input value={newFileName} onChange={e => setNewFileName(e.target.value)}
                                       onKeyDown={e => e.key === "Enter" && handleCreateFile()}
                                       placeholder="New file name"
                                       style={{ ...S.sideInput, marginBottom: 6 }} />
                                <button onClick={handleCreateFile} style={S.createBtn("#22c55e")}>
                                    + Create File
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: "16px 12px", fontSize: 11, color: "#333", textAlign: "center" }}>
                            Select a workspace to see files
                        </div>
                    )}
                </div>
            </div>

            {/* STATUS BAR */}
            <div style={S.statusBar}>
                <div style={{ display: "flex", gap: 16 }}>
                    <span>CodeCollab Platform</span>
                    {selectedWorkspace && <span>Workspace: {selectedWorkspace.workSpaceName}</span>}
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                    {selectedFile && <span>{getFileIcon(selectedFile.fileName)} {selectedFile.fileName}</span>}
                    <span>{isWebSocketConnected ? "🟢 Connected" : "⚫ Offline"}</span>
                    <span>{username}</span>
                </div>
            </div>
        </div>
    );
}