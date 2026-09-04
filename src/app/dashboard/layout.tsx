import AuthSessionProvider from "@/lib/sessionProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthSessionProvider>
      <div className="dashboard">
        <main>{children}</main>
      </div>
    </AuthSessionProvider>
  );
}
