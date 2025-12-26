import { useEffect, useState, useRef } from "react";
import { getFiles, getWorkspaces, createFile, createWorkspace, deleteFile, updateFileContent } from "../api";
import { connectWebSocket, sendCodeOperation, disconnectWebSocket } from "../websocket";
import Editor from "@monaco-editor/react";

export default function MainLayout({ token }) {
    const [workspaces, setWorkspaces] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState("");
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [newFileName, setNewFileName] = useState("");
    const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
    const [otherCursors, setOtherCursors] = useState({}); // { userId: { position, color, username } }

    const myColorRef = useRef(`hsl(${Math.random() * 360}, 70%, 60%)`);
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const clientIdRef = useRef(crypto.randomUUID());
    const usernameRef = useRef(`user_${Math.random().toString(36).slice(2, 9)}`);
    const lastSentRef = useRef(null);

    useEffect(() => {
        loadWorkspaces();
        loadFiles();
    }, [token]);


    useEffect(() => {
        if (selectedFile && selectedFile.content !== undefined) {
            setFileContent(selectedFile.content);
        } else {
            setFileContent("");
        }
    }, [selectedFile]);

    useEffect(() => {
        if (!selectedFile) {
            disconnectWebSocket();
            setIsWebSocketConnected(false);
            return;
        }

        connectWebSocket(usernameRef.current, handleIncomingCodeOperation);
        setIsWebSocketConnected(true);

        return () => {
            disconnectWebSocket();
            setIsWebSocketConnected(false);
        };
    }, [selectedFile]);

    function handleIncomingCodeOperation(operation) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📨 RECEIVED OPERATION:', operation.codeTextType);

        if (!selectedFile) {
            console.log(' BLOCKED: No file selected');
            return;
        }

        if (operation.fileId !== selectedFile.id) {
            console.log(' BLOCKED: Different file');
            return;
        }

        if (operation.clientId === clientIdRef.current) {
            console.log(' BLOCKED: My own operation');
            return;
        }

        // Handle cursor movements
        if (operation.codeTextType === "CURSOR_MOVED") {
            setOtherCursors(prev => ({
                ...prev,
                [operation.clientId]: {
                    position: operation.position,
                    color: operation.color,
                    username: operation.username
                }
            }));
            return;
        }

        // Handle text operations
        console.log(' Applying operation!');
        applyOperation(operation);
    }

    function applyOperation(operation) {
        const { codeTextType, codeText, position, length } = operation;

        console.log('🔧 APPLYING OPERATION:', codeTextType);
        console.log('   Text:', codeText);
        console.log('   Position:', position);
        console.log('   Length:', length);

        setFileContent((prev) => {
            console.log('   Previous content:', prev);

            let newContent;
            switch (codeTextType) {
                case "TEXT_INSERTED": {
                    const before = prev.slice(0, position);
                    const after = prev.slice(position);
                    newContent = before + (codeText ?? "") + after;
                    console.log('    INSERT - New content:', newContent);
                    return newContent;
                }

                case "TEXT_DELETED": {
                    const before = prev.slice(0, position);
                    const after = prev.slice(position + (length ?? 0));
                    newContent = before + after;
                    console.log('    DELETE - New content:', newContent);
                    return newContent;
                }

                case "TEXT_REPLACED": {
                    const before = prev.slice(0, position);
                    const after = prev.slice(position + (length ?? 0));
                    newContent = before + (codeText ?? "") + after;
                    console.log('    REPLACE - New content:', newContent);
                    return newContent;
                }

                default:
                    console.log('    Unknown operation type');
                    return prev;
            }
        });
    }

    function handleEditorChange(value, event) {
        setFileContent(value);

        if (!event || !selectedFile) return;

        const changes = event.changes;
        if (!changes?.length) return;

        const change = changes[0];

        // Get position offset
        const position = editorRef.current
            .getModel()
            .getOffsetAt(change.range.getStartPosition());

        let operation;

        if (change.text && change.rangeLength === 0) {
            operation = {
                codeTextType: "TEXT_INSERTED",
                codeText: change.text,
                position,
                length: 0
            };
        } else if (!change.text && change.rangeLength > 0) {
            operation = {
                codeTextType: "TEXT_DELETED",
                codeText: "",
                position,
                length: change.rangeLength
            };
        } else {
            operation = {
                codeTextType: "TEXT_REPLACED",
                codeText: change.text,
                position,
                length: change.rangeLength
            };
        }

        operation.fileId = selectedFile.id;
        operation.username = usernameRef.current;
        operation.clientId = clientIdRef.current;
        operation.timestamp = Date.now();

        sendCodeOperation(operation);
    }

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;

        editor.onDidChangeCursorPosition((e) => {
            if (!selectedFile) return;

            const cursorOperation = {
                codeTextType: "CURSOR_MOVED",
                position: editor.getModel().getOffsetAt(e.position),
                fileId: selectedFile.id,
                username: usernameRef.current,
                clientId: clientIdRef.current,
                timestamp: Date.now(),
                color: myColorRef.current
            };

            sendCodeOperation(cursorOperation);
        });
    }

    async function loadWorkspaces() {
        try {
            const data = await getWorkspaces(token);
            setWorkspaces(data);
        } catch (err) {
            console.error(err);
        }
    }

    async function loadFiles() {
        try {
            const data = await getFiles(token);
            setFiles(data);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleCreateWorkspace() {
        if (!newWorkspaceName.trim()) return;
        try {
            await createWorkspace(token, newWorkspaceName);
            setNewWorkspaceName("");
            await loadWorkspaces();
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleCreateFile() {
        if (!newFileName.trim() || !selectedWorkspace) return;
        try {
            await createFile(token, newFileName, selectedWorkspace.id);
            setNewFileName("");
            await loadFiles();
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleSaveFile() {
        if (!selectedFile) return;
        try {
            await updateFileContent(token, selectedFile.id, fileContent);
            alert("File saved!");
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleDeleteFile(fileId) {
        if (!confirm("Delete this file?")) return;
        try {
            await deleteFile(token, fileId);
            if (selectedFile?.id === fileId) {
                setSelectedFile(null);
                setFileContent("");
            }
            await loadFiles();
        } catch (err) {
            alert(err.message);
        }
    }

    const workspaceFiles = selectedWorkspace
        ? files.filter((f) => f.workspaceId === selectedWorkspace.id)
        : [];

    return (
        <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
            {/* LEFT - Workspaces (Narrow) */}
            <div style={{
                width: "200px",
                minWidth: "200px",
                borderRight: "1px solid #333",
                padding: "1rem",
                background: "#1e1e1e",
                color: "#fff"
            }}>
                <h3 style={{ marginTop: 0, color: "#fff" }}>Workspaces</h3>

                {isWebSocketConnected && (
                    <div style={{
                        padding: "0.5rem",
                        marginBottom: "1rem",
                        background: "#4caf50",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "12px",
                        textAlign: "center"
                    }}>
                        ✓ Live Connected
                    </div>
                )}

                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {workspaces.map((ws) => (
                        <div
                            key={ws.id}
                            onClick={() => setSelectedWorkspace(ws)}
                            style={{
                                padding: "0.75rem",
                                margin: "0.25rem 0",
                                background: selectedWorkspace?.id === ws.id ? "#007acc" : "#252526",
                                border: "1px solid #333",
                                cursor: "pointer",
                                borderRadius: "4px",
                                color: "#fff",
                                transition: "background 0.2s"
                            }}
                        >
                            {ws.workSpaceName}
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                    <input
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
                        placeholder="New workspace"
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            marginBottom: "0.5rem",
                            background: "#252526",
                            border: "1px solid #333",
                            color: "#fff",
                            borderRadius: "4px"
                        }}
                    />
                    <button
                        onClick={handleCreateWorkspace}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            cursor: "pointer",
                            background: "#007acc",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontWeight: "bold"
                        }}
                    >
                        Create Workspace
                    </button>
                </div>
            </div>

            {/* MIDDLE - Monaco Editor (Larger) */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                minWidth: "600px"
            }}>
                <div style={{
                    padding: "1rem",
                    borderBottom: "1px solid #333",
                    background: "#252526",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                        {selectedFile ? selectedFile.fileName : "No file selected"}
                    </span>
                    {selectedFile && (
                        <button onClick={handleSaveFile} style={{
                            marginLeft: "1rem",
                            padding: "0.5rem 1.5rem",
                            background: "#007acc",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}>
                            Save
                        </button>
                    )}
                </div>

                {selectedFile ? (
                    <div style={{ flex: 1, position: "relative", background: "#1e1e1e" }}>
                        <Editor
                            height="100%"
                            language="javascript"
                            value={fileContent}
                            onChange={handleEditorChange}
                            onMount={handleEditorDidMount}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: true },
                                fontSize: 14,
                                wordWrap: "on",
                                automaticLayout: true,
                                cursorBlinking: "smooth",
                                cursorSmoothCaretAnimation: "on",
                                renderLineHighlight: "all",
                                scrollBeyondLastLine: false,
                                padding: { top: 16, bottom: 16 },
                                lineNumbers: "on",
                                glyphMargin: true,
                                folding: true,
                                lineDecorationsWidth: 10,
                                lineNumbersMinChars: 3
                            }}
                        />
                    </div>
                ) : (
                    <div style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#666",
                        background: "#1e1e1e",
                        fontSize: "18px"
                    }}>
                        Select a file to start editing
                    </div>
                )}
            </div>

            {/* RIGHT - Files (On the right side, narrower) */}
            <div style={{
                width: "280px",
                minWidth: "280px",
                borderLeft: "1px solid #333",
                padding: "1rem",
                background: "#1e1e1e",
                color: "#fff",
                overflowY: "auto"
            }}>
                <h3 style={{ marginTop: 0, color: "#fff" }}>Files</h3>

                {selectedWorkspace ? (
                    <>
                        <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "1rem" }}>
                            {workspaceFiles.map((file) => (
                                <div key={file.id} style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "0.75rem",
                                    margin: "0.35rem 0",
                                    border: "1px solid #333",
                                    borderRadius: "4px",
                                    background: selectedFile?.id === file.id ? "#252526" : "transparent",
                                    transition: "background 0.2s"
                                }}>
                                    <span
                                        onClick={() => setSelectedFile(file)}
                                        style={{
                                            cursor: "pointer",
                                            flex: 1,
                                            fontWeight: selectedFile?.id === file.id ? "bold" : "normal",
                                            color: selectedFile?.id === file.id ? "#4fc3f7" : "#fff",
                                            fontSize: "14px"
                                        }}
                                    >
                                        {file.fileName}
                                    </span>
                                    <button onClick={() => handleDeleteFile(file.id)} style={{
                                        marginLeft: "0.5rem",
                                        padding: "0.25rem 0.5rem",
                                        background: "#d32f2f",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "3px",
                                        cursor: "pointer",
                                        fontSize: "12px"
                                    }}>
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: "auto" }}>
                            <input
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                placeholder="New file name"
                                style={{
                                    width: "100%",
                                    padding: "0.75rem",
                                    marginBottom: "0.5rem",
                                    background: "#252526",
                                    border: "1px solid #333",
                                    color: "#fff",
                                    borderRadius: "4px"
                                }}
                            />
                            <button onClick={handleCreateFile} style={{
                                width: "100%",
                                padding: "0.75rem",
                                background: "#388e3c",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}>
                                Create File
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{
                        color: "#666",
                        textAlign: "center",
                        padding: "2rem 0",
                        fontSize: "14px"
                    }}>
                        Select a workspace first to see files
                    </div>
                )}
            </div>
        </div>
    );
}