import RegisterForm from "@/components/blocks/register-form";
import AuthShell from "@/components/blocks/auth-shell";

const RegisterPage = () => {
  return (
    <AuthShell
      eyebrow="Lead Pilot"
      title="Grow your cold journey"
      description="Create your workspace and keep cold outreach organized from the first lead to the final follow-up."
    >
      <RegisterForm />
    </AuthShell>
  );
};

export default RegisterPage;
