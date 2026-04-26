import LoginForm from "@/components/login-form";
import { Rocket } from "lucide-react";

const LoginPage = () => {
  return (
    <main
      className="min-h-screen flex items-center justify-center "
      style={{ background: "var(--gradient-surface)" }}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-elegant)" }}
          >
            <Rocket className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Lead Pilot</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Dashboard</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
};

export default LoginPage;
