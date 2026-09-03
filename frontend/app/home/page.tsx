"use client";

import { useRouter } from "next/navigation";
import { FilePlus2, ListChecks, ArrowRight } from "lucide-react";
import Barrelayout from "../component/Barrelayout";

export default function NoteLayout() {
  const router = useRouter();

  const cards = [
    {
      title: "Nouvelle note de frais",
      description:
        "Ajoutez une dépense en quelques clics avec justificatif et commentaires.",
      redirect: "/notefrais",
      icon: FilePlus2,
    },
    {
      title: "Consulter mes notes",
      description:
        "Visualisez l'historique de vos notes de frais et suivez leur statut.",
      redirect: "/mesnotes",
      icon: ListChecks,
    },
  ];

  return (
    <Barrelayout>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Gestion des notes de frais</h1>
      <p className="text-slate-500 mb-8">Que souhaitez-vous faire ?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="card p-6 hover:border-blue-300 hover:shadow-md transition cursor-pointer group"
            onClick={() => router.push(card.redirect)}
          >
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-blue-50 text-blue-600 mb-4">
              <card.icon size={22} />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">{card.description}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
              Continuer <ArrowRight size={16} />
            </span>
          </div>
        ))}
      </div>
    </Barrelayout>
  );
}