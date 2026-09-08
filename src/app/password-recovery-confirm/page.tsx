import { ConfirmPassword } from "@/Components/AuthPage/ConfirmPassword/ConfirmPassword";
import { LoginHeader } from "@/Components/AuthPage/LoginHeader/LoginHeader";
import { Suspense } from "react";

export default function RecoveryConfirmPassword() {
  return (
    <Suspense fallback={null}>
      <LoginHeader />
      <ConfirmPassword />
    </Suspense>
  );
}
