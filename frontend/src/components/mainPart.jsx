import MainLayout from "./MainLayout";

export default function MainPart({ token, username, onLogout }) {
    return <MainLayout token={token} username={username} onLogout={onLogout} />;
}