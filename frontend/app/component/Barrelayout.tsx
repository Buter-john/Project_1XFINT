"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Receipt, UserPlus, LogOut } from "lucide-react";
import { API_URL } from "../lib/api";

type MeResponse = { role: string };
type UserState = { role: string } | null;

export default function Barrelayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
          setLoading(false);
          return;
        }

        const data: MeResponse = await res.json();
        setUser({ role: data.role.toLowerCase() });
      } catch (err) {
        console.error("Erreur fetch /me:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const isManager = user?.role === "manager";

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      window.location.href = "/login";
    }
  };

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
        pathname === href
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
        <Link href="/home" className="flex items-center gap-2 text-slate-900 font-semibold">
          <Receipt size={22} className="text-blue-600" />
          Sup Herman
        </Link>
        <nav className="flex items-center gap-1">
          {navLink("/home", "Accueil")}
          {navLink("/profil", "Mon profil")}

          {!loading && isManager && (
            <Link
              href="/create_user"
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <UserPlus size={16} />
              Créer un utilisateur
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </nav>
      </header>

      <main className="flex-grow p-6 max-w-5xl w-full mx-auto">{children}</main>
    </div>
  );
}