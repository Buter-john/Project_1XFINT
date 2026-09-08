# Sup Herman - Gestion des notes de frais

Application web qui permet aux employés de soumettre des notes de frais (avec justificatif), et aux managers/comptabilité de les valider ou les refuser.

Projet composé de deux applications séparées :
- **backend/** : API (Next.js, routes API uniquement, pas d'interface)
- **frontend/** : interface utilisateur (Next.js + React + Tailwind CSS)

## Stack utilisée

- Next.js 15 (App Router) pour le backend et le frontend
- Prisma + MySQL pour la base de données
- JWT (jsonwebtoken) pour l'authentification, stocké dans un cookie HttpOnly
- bcryptjs pour le hachage des mots de passe
- Joi pour la validation des formulaires
- Tailwind CSS pour le style du frontend

## Fonctionnalités

- Connexion avec email / mot de passe
- Changement de mot de passe obligatoire à la première connexion
- Création d'utilisateurs par un manager (rôle Employé, Manager ou Comptabilité)
- Création d'une note de frais avec titre, commentaire et justificatif (PDF, PNG, JPG, WEBP - 5 Mo max)
- Deux vues distinctes pour consulter les notes de frais :
  - **Mes notes** (`/mesnotes`) : accessible à tous les rôles, affiche uniquement les notes que l'utilisateur connecté a lui-même soumises, sans action possible
  - **Toutes les notes** (`/toutes-les-notes`) : accessible seulement aux managers et à la comptabilité
    - un manager voit toutes les notes et peut les valider ou les refuser
    - la comptabilité voit les notes validées ou traitées et peut les marquer comme traitées
- Protection des routes : impossible d'accéder à une page sans être connecté
- Rate limiting sur le login (5 tentatives max toutes les 15 minutes)

## Rôles et workflow

Une note de frais passe par ces statuts :

```
CREEE  --(manager valide)-->  VALIDEE  --(comptabilité traite)-->  TRAITEE
  |
  --(manager refuse)-->  REFUSEE
```

Seul un manager peut faire passer une note de CREEE à VALIDEE ou REFUSEE. Seule la comptabilité peut faire passer une note de VALIDEE à TRAITEE. Aucune autre transition n'est autorisée.

## Installation

### Prérequis

- Node.js (v18 ou plus)
- MySQL installé et lancé en local
- npm

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd Project_1XFINT
```

### 2. Configurer et lancer le backend

```bash
cd backend
npm install
```

Crée un fichier `.env` à la racine de `backend/` avec :

```
DATABASE_URL="mysql://root:motdepasse@localhost:3306/sup_herman"
JWT_SECRET="change-moi-en-une-longue-chaine-en-fonction-de-toi"
ALLOWED_ORIGIN="http://localhost:4000"
```

Adapte `DATABASE_URL` avec tes propres identifiants MySQL. La base `sup_herman` n'a pas besoin d'exister avant, Prisma la crée automatiquement.

Applique les migrations et crée un premier utilisateur de test :

```bash
npx prisma migrate dev
npx prisma db seed
```

Ça crée un compte manager de test :
- email : `manager@supherman.com`
- mot de passe : `Suph3rm4n!`

Lance le serveur backend :

```bash
npm run dev
```

Le backend tourne sur `http://localhost:3000`.

### 3. Configurer et lancer le frontend

Dans un autre terminal :

```bash
cd frontend
npm install
npm run dev
```

Le frontend tourne sur `http://localhost:4000`.

### 4. Utiliser l'application

Va sur `http://localhost:4000` dans ton navigateur (redirige automatiquement vers `/login`). Connecte-toi avec le compte manager créé par le seed, ou crée d'autres comptes une fois connecté en tant que manager.

## Structure du projet

```
Project_1XFINT/
├── backend/
│   ├── app/api/users/       -> toutes les routes de l'API
│   ├── Middleware/          -> CORS, auth, validation Joi
│   ├── Utils/                -> JWT, cookie, connexion DB, rate limit
│   └── prisma/                -> schema de la base et migrations
└── frontend/
    ├── app/                  -> une page par route (login, home, profil, ...)
    ├── app/component/     -> composants réutilisables (formulaires, layout, alertes)
    └── app/lib/api.ts       -> adresse de l'API backend
    └── middleware.ts       -> protège les pages, redirige vers /login si pas connecté
```

## Documentation

- [MANUEL_UTILISATION.md](./MANUEL_UTILISATION.md) : guide d'utilisation par rôle (employé, manager, comptabilité)
- [ARCHITECTURE.md](./ARCHITECTURE.md) : documentation technique (modèle de données, authentification, sécurité, workflow)
