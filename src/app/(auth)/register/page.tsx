import RegisterForm from "@/components/blocks/register-form";
import AuthShell from "@/components/blocks/auth-shell";

const RegisterPage = () => {
  return (
    <AuthShell
      eyebrow="Lead Pilot"
      title="Create account"
      description="Fill in the form to get started."
    >
      <RegisterForm />
    </AuthShell>
  );
};

export default RegisterPage;
