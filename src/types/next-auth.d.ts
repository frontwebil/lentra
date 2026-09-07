import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      phone: string;
      companyName: string;
      language: "uk" | "en";
    };
  }

  interface User {
    id: string;
    email: string;
    phone: string;
    companyName: string;
    language: "uk" | "en";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    phone: string;
    companyName: string;
    language: "uk" | "en";
  }
}
