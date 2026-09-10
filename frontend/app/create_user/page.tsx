"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { API_URL } from "../lib/api";
import Barrelayout from "../component/Barrelayout";
import AlertMessage from "../component/AlerteMessage";

const CreateUserForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYE"); // valeur par défaut
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

      if (!email.endsWith("@supherman.com")) {
      setError("L'adresse email doit se terminer par @supherman.com");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);

      const response = await fetch(`${API_URL}/api/users/create`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création");
      }

      setMessage(`Utilisateur créé : ${data.user.email} (${data.user.role})`);
      setEmail("");
      setPassword("");
      setRole("EMPLOYE");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Barrelayout>
      <div className="max-w-md card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
            <UserPlus size={20} />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Créer un utilisateur</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Mot de passe temporaire</label>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="field-label">Rôle</label>
            <select
              className="field-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="EMPLOYE">Employé</option>
              <option value="MANAGER">Manager</option>
              <option value="COMPTABILITE">Comptabilité</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full">
            Créer l'utilisateur
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            {message}
          </p>
        )}
        {error && (
          <div className="mt-4">
            <AlertMessage title="Erreur" error={error} />
          </div>
        )}
      </div>
    </Barrelayout>
  );
};

export default CreateUserForm;