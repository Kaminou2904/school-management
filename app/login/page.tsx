"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!result?.ok || result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    // Hard redirect so the browser sends the new session cookie in the next request.
    // The proxy reads the token and redirects to the correct dashboard by role.
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-navy p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange rounded-xl flex items-center justify-center text-white text-xl font-bold">
            S
          </div>
          <span className="text-white font-bold text-xl">School MS</span>
        </div>

        <div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Welcome to the<br />
            <span className="text-orange">School Management</span><br />
            System
          </h1>
          <p className="text-white/60 text-lg">
            Manage your school branches, teachers, students and attendance — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: "🏫", label: "Branches" },
            { icon: "👨‍🏫", label: "Teachers" },
            { icon: "🎓", label: "Students" },
          ].map((item) => (
            <div key={item.label} className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-white/70 text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-white text-xl font-bold">
              S
            </div>
            <span className="text-navy font-bold text-xl">School MS</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-navy mb-1">Sign In</h2>
              <p className="text-gray-400 text-sm">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy hover:bg-navy-light text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 p-4 bg-orange-light/30 rounded-xl border border-orange/20">
              <p className="text-xs font-semibold text-orange-dark mb-2">Demo Credentials</p>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Admin:</strong> admin@school.com</p>
                <p><strong>Teacher:</strong> teacher1@school.com</p>
                <p><strong>Student:</strong> student1@school.com</p>
                <p className="text-gray-400">Password: password123 (visit /api/seed first)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
