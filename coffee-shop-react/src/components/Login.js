import { useState } from "react";
import api from "../services/api"; // ใช้ api service ที่มีอยู่แล้ว

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.login(username, password);
      console.log("login ok:", data);
      // TODO: เก็บ token / redirect หน้า
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
