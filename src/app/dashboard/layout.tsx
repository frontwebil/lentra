import { SideBar } from "@/Components/Dashboard/SideBar/SideBar";
import "@/Components/Dashboard/styles/common.css";
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
        {children}
      </div>
    </AuthSessionProvider>
  );
}
