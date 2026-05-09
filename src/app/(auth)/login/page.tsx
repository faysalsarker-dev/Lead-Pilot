import LoginForm from "@/components/blocks/login-form";
import AuthShell from "@/components/blocks/auth-shell";

const LoginPage = () => {
  return (
    <AuthShell
      eyebrow="Lead Pilot"
      title="Welcome back to work"
      description="Sign in and continue organizing your outreach, leads, and follow-ups."
    >
      <LoginForm />
    </AuthShell>
  );
};

export default LoginPage;
