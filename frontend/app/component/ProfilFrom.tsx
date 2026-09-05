"use client";

import { useEffect, useState } from "react";
import { UserCircle2 } from "lucide-react";
import { API_URL } from "../lib/api";

type Profil = {
  email: string;
  role: string;
};

const ProfilFrom = () => {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfil() {
      try {
        const res = await fetch(`${API_URL}/api/users/profil`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Impossible de charger le profil");
        } else {
          setProfil(data.user);
        }
      } catch (err) {
        setError("Erreur serveur");
      } finally {
        setLoading(false);
      }
    }

    fetchProfil();
  }, []);

  if (loading) return <p className="text-slate-500">Chargement...</p>;
  if (error) return <p className="text-rose-600">{error}</p>;

  return (
    <div className="max-w-lg card p-6">
      <h1 className="text-lg font-semibold text-slate-900 mb-6">Mon profil</h1>
      {profil && (
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600">
            <UserCircle2 size={32} />
          </div>
          <div>
            <p className="text-slate-900 font-medium">{profil.email}</p>
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 mt-1">{profil.role}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilFrom;