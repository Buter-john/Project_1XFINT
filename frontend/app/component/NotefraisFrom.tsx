"use client"
import React, { useState } from "react";
import { Paperclip } from "lucide-react";
import AlertMessage from "./AlerteMessage";
import { API_URL } from "../lib/api";


const NotefraisFrom = () => {
    const [titre, setTitre] = useState("");
    const [commentaire, setCommentaire] = useState("");
    const [fichiers, setFichiers] = useState<File[]>([]);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        
    const formData = new FormData();
    formData.append("titre", titre);
    formData.append("commentaire", commentaire);
    
    
    if (fichiers) {
        for ( let i = 0; i < fichiers.length; i++) {
            formData.append("fichiers", fichiers[i]);
        }
    }

    try {
        const res = await fetch(`${API_URL}/api/users/note-frais`, {
            method: "POST",
            credentials: "include",
            body: formData,
          });

          const data = await res.json();

          if (res.ok) {
            window.location.href = "/home";
          } else {
            setErrorMessage(data.error || "Une erreur est survenue");
          }
    } catch (error) {
        setErrorMessage("Une erreur est survenue lors de la soumission de la note de frais");
    }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl card p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Créer une note de frais</h2>
            <p className="text-sm text-slate-500 mt-0.5">PDF, PNG, JPG ou WEBP — 5 Mo max par fichier</p>
          </div>

          <div>
            <label className="field-label">Titre</label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              required
              className="field-input"
              placeholder="Ex : Déjeuner client"
            />
          </div>

          <div>
            <label className="field-label">Commentaire</label>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              required
              rows={4}
              className="field-input"
              placeholder="Détails de la dépense..."
            />
          </div>

          <div>
            <label className="field-label">Fichiers justificatifs</label>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-lg py-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
              <Paperclip className="text-slate-400" size={20} />
              <span className="text-sm text-slate-500">
                {fichiers.length > 0
                  ? `${fichiers.length} fichier(s) sélectionné(s)`
                  : "Cliquez pour joindre un ou plusieurs fichiers"}
              </span>
              <input
                type="file"
                multiple
                onChange={(e) => setFichiers(e.target.files ? Array.from(e.target.files) : [])}
                className="hidden"
              />
            </label>
          </div>

          <button type="submit" className="btn-primary w-full">
            Soumettre
          </button>

          {errorMessage && <AlertMessage title="Erreur" error={errorMessage} />}
        </form>
      );
};

export default NotefraisFrom;