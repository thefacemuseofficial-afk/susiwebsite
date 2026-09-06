import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/mockAuth";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    navigate("/");
  };

  const handleGoogle = () => {
    signInWithGoogle();
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-6">
      <div className="pt-6 pb-2"><Logo /></div>
      <main className="flex-1 flex flex-col items-center justify-center w-full">
        <h1 className="font-display text-xl font-bold text-foreground mb-6 text-center">Log In to The Face Muse</h1>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="rounded-xl bg-card border-foreground/10" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="rounded-xl bg-card border-foreground/10" required />
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary text-primary-foreground py-3">
            {loading ? "Signing in…" : "Log In"}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-foreground/10" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
          </div>

          <Button type="button" variant="outline" onClick={handleGoogle} className="w-full rounded-full py-3">Continue with Google</Button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="underline underline-offset-4 text-foreground hover:text-foreground/80">Sign up</Link>
        </p>
      </main>
    </div>
  );
}
