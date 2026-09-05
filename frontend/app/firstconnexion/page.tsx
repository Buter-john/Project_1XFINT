"use client"

import React, { useState } from "react";
import { KeyRound } from "lucide-react";
import { API_URL } from "../lib/api";
import AlertMessage from "../component/AlerteMessage";


export default function FirstConnexion() {

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");


        try {
            const res = await fetch(`${API_URL}/api/users/change-password`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();
            if (res.ok) {
                window.location.href = "/home";
            } else {
                setError(data.error || "erreur");
            }
        } catch (err) {
            setError("Impossible de contacter le serveur");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <form onSubmit={handleSubmit} className="card w-full max-w-md p-8">
                <div className="mb-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-3">
                        <KeyRound className="text-blue-600" size={22} />
                    </div>
                    <h1 className="text-lg font-semibold text-slate-900">Changer votre mot de passe</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Première connexion : choisissez un nouveau mot de passe
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="field-label">Mot de passe actuel</label>
                        <input
                            type="password"
                            className="field-input"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="field-label">Nouveau mot de passe</label>
                        <input
                            type="password"
                            className="field-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full">
                        Valider
                    </button>

                    {error && <AlertMessage title="Erreur" error={error} />}
                </div>
            </form>
        </div>
    );
}