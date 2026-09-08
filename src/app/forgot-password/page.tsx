import { ForgotPassword } from "@/Components/AuthPage/ForgotPassword/ForgotPassword";
import { LoginHeader } from "@/Components/AuthPage/LoginHeader/LoginHeader";
import AuthSessionProvider from "@/lib/sessionProvider";

export default function page() {
  return (
    <AuthSessionProvider>
      <LoginHeader />
      <ForgotPassword />
    </AuthSessionProvider>
  );
}
