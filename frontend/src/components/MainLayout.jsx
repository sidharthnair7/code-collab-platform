import { useEffect, useState } from "react";
import { getFiles, getWorkspaces, createFile, createWorkspace, deleteFile, deleteWorkspace, updateFileContent } from "../api";

export default function MainLayout({ token }) {
    const [workspaces, setWorkspaces] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState("");
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [newFileName, setNewFileName] = useState("");

    useEffect(() => {
        loadWorkspaces();
        loadFiles();
    }, [token]);

    useEffect(() => {
        if (selectedFile) {
            setFileContent(selectedFile.content || "");
        }
    }, [selectedFile]);

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
        ? files.filter(f => f.workspaceId === selectedWorkspace.id)
        : [];

    return (
        <div style={{ display: "flex", height: "100vh" }}>
            {/* LEFT - Workspaces */}
            <div style={{ width: "250px", borderRight: "1px solid #ccc", padding: "1rem" }}>
                <h3>Workspaces</h3>

                {workspaces.map((ws) => (
                    <div
                        key={ws.id}
                        onClick={() => setSelectedWorkspace(ws)}
                        style={{
                            padding: "0.5rem",
                            margin: "0.25rem 0",
                            background: selectedWorkspace?.id === ws.id ? "#e0e0e0" : "#fff",
                            border: "1px solid #ccc",
                            cursor: "pointer"
                        }}
                    >
                        {ws.name}
                    </div>
                ))}

                <input
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCreateWorkspace()}
                    placeholder="New workspace name"
                    style={{ width: "100%", padding: "0.5rem", marginTop: "1rem" }}
                />
                <button
                    onClick={handleCreateWorkspace}
                    style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem", cursor: "pointer" }}
                >
                    Create Workspace
                </button>
            </div>

            {/* MIDDLE - Code Editor */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
                    <span>{selectedFile ? selectedFile.fileName : "No file selected"}</span>
                    {selectedFile && (
                        <button onClick={handleSaveFile} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
                            Save
                        </button>
                    )}
                </div>

                {selectedFile ? (
                    <textarea
                        value={fileContent}
                        onChange={(e) => setFileContent(e.target.value)}
                        style={{
                            flex: 1,
                            padding: "1rem",
                            border: "none",
                            fontFamily: "monospace",
                            fontSize: "14px",
                            resize: "none"
                        }}
                    />
                ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
                        Select a file to edit
                    </div>
                )}
            </div>

            {/* RIGHT - Files */}
            <div style={{ width: "250px", borderLeft: "1px solid #ccc", padding: "1rem" }}>
                <h3>Files</h3>

                {selectedWorkspace ? (
                    <>
                        {workspaceFiles.map((file) => (
                            <div key={file.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem", margin: "0.25rem 0", border: "1px solid #ccc" }}>
                                <span
                                    onClick={() => setSelectedFile(file)}
                                    style={{ cursor: "pointer", flex: 1 }}
                                >
                                    {file.fileName}
                                </span>
                                <button onClick={() => handleDeleteFile(file.id)} style={{ marginLeft: "0.5rem" }}>
                                    X
                                </button>
                            </div>
                        ))}

                        <input
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="New file name"
                            style={{ width: "100%", padding: "0.5rem", marginTop: "1rem" }}
                        />
                        <button onClick={handleCreateFile} style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}>
                            Create File
                        </button>
                    </>
                ) : (
                    <p style={{ color: "#999" }}>Select a workspace first</p>
                )}
            </div>
        </div>
    );
}