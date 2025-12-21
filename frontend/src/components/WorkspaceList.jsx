import { useState } from "react";

export default function WorkspaceList({ files, token, onDelete, onRename, onUpdateContent, onRefresh }) {
    const [editingId, setEditingId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    const [renamingId, setRenamingId] = useState(null);
    const [newName, setNewName] = useState("");

    function startEditing(file) {
        setEditingId(file.id);
        setEditingContent(file.content || "");
    }

    function cancelEditing() {
        setEditingId(null);
        setEditingContent("");
    }

    async function saveContent(id) {
        await onUpdateContent(id, editingContent);
        setEditingId(null);
        setEditingContent("");
    }

    function startRenaming(file) {
        setRenamingId(file.id);
        setNewName(file.fileName);
    }

    function cancelRenaming() {
        setRenamingId(null);
        setNewName("");
    }

    async function saveRename(id) {
        await onRename(id, newName);
        setRenamingId(null);
        setNewName("");
    }

    const [isCreating, setIsCreating] = useState(false);
    const [newFileName, setNewFileName] = useState("");
    const [workspaceId, setWorkspaceId] = useState("1");

    async function handleCreateFile() {
        if (!newFileName.trim()) return;
        try {
            const { createFile } = await import("../api");
            await createFile(token, newFileName, parseInt(workspaceId));
            setNewFileName("");
            setIsCreating(false);
            onRefresh();
        } catch (err) {
            alert("Failed to create file: " + err.message);
        }
    }

    return (
        <div style={{ padding: "1rem" }}>
            <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button onClick={onRefresh}>Refresh Files</button>
                {!isCreating && (
                    <button onClick={() => setIsCreating(true)}>Create New File</button>
                )}
            </div>

            {isCreating && (
                <div style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "4px" }}>
                    <input
                        placeholder="File name"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        style={{ marginRight: "0.5rem" }}
                    />
                    <input
                        placeholder="Workspace ID"
                        type="number"
                        value={workspaceId}
                        onChange={(e) => setWorkspaceId(e.target.value)}
                        style={{ marginRight: "0.5rem", width: "100px" }}
                    />
                    <button onClick={handleCreateFile}>Create</button>
                    <button onClick={() => setIsCreating(false)} style={{ marginLeft: "0.5rem" }}>
                        Cancel
                    </button>
                </div>
            )}


            {files.length === 0 ? (
                <p>No files found. Create one from your workspace!</p>
            ) : (
                <div>
                    {files.map((file) => (
                        <div
                            key={file.id}
                            style={{
                                border: "1px solid #ccc",
                                padding: "1rem",
                                marginBottom: "1rem",
                                borderRadius: "4px",
                            }}
                        >
                            {renamingId === file.id ? (
                                <div>
                                    <input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        style={{ marginRight: "0.5rem" }}
                                    />
                                    <button onClick={() => saveRename(file.id)}>Save</button>
                                    <button onClick={cancelRenaming}>Cancel</button>
                                </div>
                            ) : (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <strong>{file.fileName}</strong>
                                    <div>
                                        <button onClick={() => startRenaming(file)}>Rename</button>
                                        <button onClick={() => onDelete(file.id)} style={{ marginLeft: "0.5rem" }}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}

                            {editingId === file.id ? (
                                <div style={{ marginTop: "1rem" }}>
                                    <textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        style={{ width: "100%", minHeight: "100px" }}
                                    />
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <button onClick={() => saveContent(file.id)}>Save Content</button>
                                        <button onClick={cancelEditing} style={{ marginLeft: "0.5rem" }}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ marginTop: "0.5rem" }}>
                                    <p>{file.content || "(empty)"}</p>
                                    <button onClick={() => startEditing(file)}>Edit Content</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}