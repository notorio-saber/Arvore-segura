import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { staffLogin } from "../lib/auth";
import Button from "../components/ui/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      await staffLogin(email, senha);
      navigate("/painel");
    } catch (err) {
      setErro(err.message || "E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-forest-dark to-forest px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-forest">Árvore Segura</p>
        <h1 className="mt-2 text-xl font-extrabold text-gray-900">Acesso da equipe municipal</h1>
        <p className="mt-2 text-sm text-gray-500">Entre para acompanhar alertas, triagens e execuções do município.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-800">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-forest focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-800">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-forest focus:outline-none"
            />
          </div>

          {erro && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

          <Button type="submit" className="w-full" disabled={carregando}>
            {carregando ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          <button type="button" onClick={() => navigate("/")} className="underline">
            Voltar para o reporte público
          </button>
        </p>
      </div>
    </div>
  );
}
