"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle2, XCircle, PackageCheck, Paperclip, X } from "lucide-react";
import { API_URL } from "../lib/api";

type NoteDeFrais = {
  id: number;
  titre: string;
  statut: "CREEE" | "VALIDEE" | "REFUSEE" | "TRAITEE";
  dateSoumission: string;
  commentaire: string;
  fichiers: string; // JSON.stringify([...])
  user?: {
    email: string;
    role: string;
  };
};

export default function ListeNoteFrais() {
  const [notes, setNotes] = useState<NoteDeFrais[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteDeFrais | null>(null);
  const [role, setRole] = useState<string>("");
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [errorAction, setErrorAction] = useState<string>("");

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await fetch(`${API_URL}/api/users/list-note-frais`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setNotes(data.note_de_frais || []);
          setRole(data.role || "");
        } else {
          console.error("Erreur :", data.error);
        }
      } catch (err) {
        console.error("Erreur fetch :", err);
      }
    }
    fetchNotes();
  }, []);

  const updateStatut = async (id: number, newStatut: NoteDeFrais["statut"]) => {
    setLoadingAction(true);
    setErrorAction("");
    try {
      const res = await fetch(`${API_URL}/api/users/update-note-statut`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ noteId:id, statut: newStatut }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorAction(data?.error || "Échec de la mise à jour");
        return;
      }

      // Mettre à jour la note dans la liste localement
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, statut: data.note?.statut ?? newStatut } : n))
      );
      // Mettre à jour aussi la modale si ouverte
      setSelectedNote((prev) => (prev ? { ...prev, statut: data.note?.statut ?? newStatut } : prev));
    } catch (e) {
      setErrorAction("Erreur réseau");
    } finally {
      setLoadingAction(false);
    }
  };

  const statusBadge = (statut: NoteDeFrais["statut"]) => {
    const config = {
      CREEE: { label: "Créée", className: "badge-creee", Icon: Clock },
      VALIDEE: { label: "Validée", className: "badge-validee", Icon: CheckCircle2 },
      REFUSEE: { label: "Refusée", className: "badge-refusee", Icon: XCircle },
      TRAITEE: { label: "Traitée", className: "badge-traitee", Icon: PackageCheck },
    }[statut];
    const { label, className, Icon } = config;
    return (
      <span className={className}>
        <Icon size={13} />
        {label}
      </span>
    );
  };

  const renderActionsForRole = (note: NoteDeFrais) => {
    // Manager : agit une fois sur CREEE -> VALIDEE ou REFUSEE
    if (role === "MANAGER" && note.statut === "CREEE") {
      return (
        <div className="flex gap-2">
          <button
            disabled={loadingAction}
            onClick={() => updateStatut(note.id, "VALIDEE")}
            className="btn-success !px-3 !py-1.5"
          >
            Valider
          </button>
          <button
            disabled={loadingAction}
            onClick={() => updateStatut(note.id, "REFUSEE")}
            className="btn-danger !px-3 !py-1.5"
          >
            Refuser
          </button>
        </div>
      );
    }

    // Comptabilité : agit une fois sur VALIDEE -> TRAITEE
    if (role === "COMPTABILITE" && note.statut === "VALIDEE") {
      return (
        <button
          disabled={loadingAction}
          onClick={() => updateStatut(note.id, "TRAITEE")}
          className="btn-primary !px-3 !py-1.5"
        >
          Marquer comme traitée
        </button>
      );
    }

    // Sinon pas d'action possible
    return <span className="text-slate-300">—</span>;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Notes de frais</h1>
        {role && (
          <span className="text-sm text-slate-500">
            Connecté en tant que <span className="font-medium text-slate-700">{role}</span>
          </span>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3 text-left font-medium">Titre</th>
                {["MANAGER", "COMPTABILITE"].includes(role) && (
                  <th className="p-3 text-left font-medium">Email</th>
                )}
                <th className="p-3 text-left font-medium">Statut</th>
                <th className="p-3 text-left font-medium">Date</th>
                <th className="p-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notes.map((note) => (
                <tr key={note.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-900">{note.titre}</td>
                  {["MANAGER", "COMPTABILITE"].includes(role) && (
                    <td className="p-3 text-slate-600">{note.user?.email || "—"}</td>
                  )}
                  <td className="p-3">{statusBadge(note.statut)}</td>
                  <td className="p-3 text-slate-600">
                    {new Date(note.dateSoumission).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedNote(note)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Voir
                      </button>
                      {renderActionsForRole(note)}
                    </div>
                  </td>
                </tr>
              ))}
              {notes.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    Aucune note à afficher.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale des détails */}
      {selectedNote && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Détails de la note</h2>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Titre</span>
                <span className="text-slate-900 font-medium">{selectedNote.titre}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Statut</span>
                {statusBadge(selectedNote.statut)}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="text-slate-900">
                  {new Date(selectedNote.dateSoumission).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Commentaire</span>
                <p className="text-slate-900 mt-1">{selectedNote.commentaire}</p>
              </div>

              <div>
                <span className="text-slate-500">Pièces justificatives</span>
                <ul className="mt-2 space-y-1">
                  {JSON.parse(selectedNote.fichiers).map((file: string, i: number) => (
                    <li key={i}>
                      <a
                        href={`${API_URL}${file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 hover:underline break-all"
                      >
                        <Paperclip size={14} className="shrink-0" />
                        {file.split("/").pop()}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions dans la modale */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-rose-600">{errorAction || null}</div>
              <div className="flex gap-2">
                {renderActionsForRole(selectedNote)}
                <button onClick={() => setSelectedNote(null)} className="btn-secondary">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}