import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import { signIn } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // Redirect after authentication
  // --------------------------------------------------

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", {
        replace: true,
      });
    }
  }, [user, authLoading, navigate]);

  // --------------------------------------------------
  // Login
  // --------------------------------------------------

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signIn(
        email,
        password
      );

      // Navigation happens in useEffect
    } catch (error: any) {
      setError(
        error.message ??
          "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-semibold text-white">
            Welcome back
          </h1>

          <p className="mt-2 text-zinc-400">
            Sign in to continue studying.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-zinc-800 bg-zinc-900 p-8"
        >

          <div className="space-y-5">

            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-zinc-500"
              />

            </div>

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-zinc-500"
              />

            </div>

          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-white px-4 py-3 font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>

          <p className="mt-6 text-center text-sm text-zinc-400">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-medium text-white hover:underline"
            >
              Create account
            </Link>

          </p>

        </form>

      </div>

    </main>
  );
}