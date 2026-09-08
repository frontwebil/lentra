import { ConfirmPassword } from "@/Components/AuthPage/ConfirmPassword/ConfirmPassword";
import { Suspense } from "react";

export default function RecoveryConfirmPassword() {
  return (
    <Suspense fallback={null}>
      <ConfirmPassword />
    </Suspense>
  );
}
