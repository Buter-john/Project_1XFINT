"use client";

import React, { useState } from "react";
import { Receipt, Mail, Lock } from "lucide-react";
import AlertMessage from "./AlerteMessage";
import { API_URL } from "../lib/api";


const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        if (data.firstLogin) {
          window.location.href = "/firstconnexion";
        } else {
          window.location.href = "/home";
        }
      } else {
        setErrorMessage(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      setErrorMessage("Connexion impossible au serveur.");
    }
  };

  return (
    <div className="w-full max-w-md card p-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-3">
          <Receipt className="text-blue-600" size={24} />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Sup Herman</h1>
        <p className="text-sm text-slate-500 mt-1">Connectez-vous à votre espace</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="field-label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="email"
              placeholder="name@email.com"
              required
              className="field-input pl-9"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="field-label">Mot de passe</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="password"
              placeholder="••••••••"
              required
              className="field-input pl-9"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full">
          Se connecter
        </button>
      </form>

      {errorMessage && (
        <div className="mt-4">
          <AlertMessage title="Erreur lors de la connexion" error={errorMessage} />
        </div>
      )}
    </div>
  );
};

export default LoginForm;