import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // <-- change if needed

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let message = `Login failed (${response.status})`;
        try {
          const err = await response.json();
          if (err?.message) message = `${message}: ${err.message}`;
        } catch {}
        throw new Error(message);
      }

      const user = await response.json();
      localStorage.setItem("userId", String(user.userId));
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to authenticate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="MyWallet Logo" className="w-20 h-20 object-contain mb-2" />
            <h1 className="text-3xl font-bold text-center text-gray-800">MyWallet</h1>
            <p className="text-gray-500 mt-1">Login</p>
          </div>

          {error && (
              <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                {error}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button
                type={"submit"}
                disabled={loading}
                className="w-full bg-green-600 text-white p-3 rounded-full font-semibold hover:bg-green-700 disabled:opacity-60 transition"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            <button
                onClick={() => navigate("/register")}
                className="w-full text-green-600 font-semibold hover:underline"
            >
              Register
            </button>
          </form>
        </div>
      </div>
  );
}
