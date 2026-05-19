import LoginForm from "@/components/blocks/login-form";
import AuthShell from "@/components/blocks/auth-shell";

const LoginPage = () => {
  return (
    <AuthShell
      eyebrow="Lead Pilot"
      title="Sign in"
      description="Enter your credentials to continue."
    >
      <LoginForm />
    </AuthShell>
  );
};

export default LoginPage;
