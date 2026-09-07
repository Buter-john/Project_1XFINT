import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login"); // Redirection vers la page de connexion
}
