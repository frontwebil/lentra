import { SideBar } from "@/Components/Dashboard/SideBar/SideBar";
import AuthSessionProvider from "@/lib/sessionProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <div className="dashboard">
        <SideBar />
        <main>{children}</main>
      </div>
    </AuthSessionProvider>
  );
}
