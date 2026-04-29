const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

function authHeaders(token) {
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

export async function login(email, password) {
    const res = await fetch(`${API_BASE}/auth/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");
    return res.json();
}

export async function signup(email, password, firstName, lastName) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
    });

    if (!res.ok) throw new Error("Signup failed");
    return res.json();
}

export async function getFiles(token) {
    const res = await fetch(`${API_BASE}/files`, {
        headers: authHeaders(token),
    });

    if (!res.ok) throw new Error("Failed to fetch files");
    return res.json();
}

export async function createFile(token, fileName, workspaceId) {
    const res = await fetch(`${API_BASE}/files`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ fileName, workspaceId }),
    });

    if (!res.ok) throw new Error("Failed to create file");
}

export async function updateFileContent(token, id, newContent) {
    const res = await fetch(`${API_BASE}/files/${id}/content`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ newContent }),
    });

    if (!res.ok) throw new Error("Failed to update content");
}

export async function renameFile(token, id, newName) {
    const res = await fetch(`${API_BASE}/files/${id}/rename`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({ newName }),
    });

    if (!res.ok) throw new Error("Failed to rename file");
}

export async function deleteFile(token, id) {
    const res = await fetch(`${API_BASE}/files/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
    });

    if (!res.ok) throw new Error("Failed to delete file");
}

export async function getWorkspaces(token) {
    const res = await fetch(`${API_BASE}/workspace`, {
        headers: authHeaders(token),
    });

    if (!res.ok) throw new Error("Failed to fetch workspaces");
    return res.json();
}

export async function getWorkspaceById(token,id){
    const res = await fetch(`${API_BASE}/workspace/${id}`, {
        headers: authHeaders(token),
    });
    if(!res.ok) throw new Error("WORKSPACE NOT FOUND");
    return res.json();
}
export async function getFilesByWorkspace(token,workspaceId) {
    const res = await fetch(`${API_BASE}/files?workspaceId=${workspaceId}`, {
        headers:authHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to get files");
    return res.json();
}

export async function createWorkspace(token, name) {
    const res = await fetch(`${API_BASE}/workspace`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ workSpaceName: name }),
    });

    if (!res.ok) throw new Error("Failed to create workspace");
}

export async function deleteWorkspace(token, id) {
    const res = await fetch(`${API_BASE}/workspace/${id}`, {
        method: "DELETE",
        headers: authHeaders(token),
    });

    if (!res.ok) throw new Error("Failed to delete workspace");
}

export async function executeCode(token,languageId,code) {
    const res = await fetch(`${API_BASE}/code/execute`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({ code, languageId  }),
    })
    if (!res.ok){
        let message = `Failed to execute code: ${res.status}`;
        try {
            const errorData = await res.json();
            message = errorData.message || errorData.error || message;
        } catch {}

        throw new Error(message);
    }

    return res.json();
}