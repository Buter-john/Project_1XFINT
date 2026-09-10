# Documentation technique - Sup Herman

Ce document explique comment le projet est construit en interne : l'architecture générale, le modèle de données, le fonctionnement de l'authentification, les choix de sécurité, et les limites connues.

## 1. Architecture générale

Le projet est séparé en deux applications indépendantes, qui ne partagent aucun code entre elles :

- **backend/** : une API Next.js (App Router), qui n'a aucune interface graphique. Chaque route vit dans `app/api/users/.../route.js` et répond en JSON.
- **frontend/** : une application Next.js classique avec des pages React, qui appelle l'API du backend en HTTP (`fetch`).

Elles tournent sur deux ports différents en développement : le backend sur `3000`, le frontend sur `4000`. C'est volontaire, pour bien séparer les deux responsabilités (API / interface), même si dans un projet plus simple on aurait pu tout mettre dans une seule app Next.js avec des Server Actions.

Comme les deux tournent sur des ports différents, chaque appel du frontend vers le backend est une requête **cross-origin**, ce qui impose de gérer le CORS manuellement côté backend (voir section 4).

## 2. Modèle de données

Deux tables, reliées par une relation "un-à-plusieurs" :

```prisma
model users {
  id              Int           @id @default(autoincrement())
  email           String        @unique
  password        String
  role            Role
  firstConnection Boolean       @default(true)
  notesFrais      NoteDeFrais[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model NoteDeFrais {
  id             Int      @id @default(autoincrement())
  titre          String
  commentaire    String
  statut         Statut   @default(CREEE)
  dateSoumission DateTime @default(now())
  fichiers       String
  user           users    @relation(fields: [userId], references: [id])
  userId         Int
}

enum Role {
  EMPLOYE
  MANAGER
  COMPTABILITE
}

enum Statut {
  CREEE
  VALIDEE
  REFUSEE
  TRAITEE
}
```

Quelques précisions sur certains champs  :

- `password` : jamais stocké en clair, toujours haché avec bcrypt avant d'être écrit en base (10 rounds de salage)
- `firstConnection` : à `true` par défaut. Passe à `false` une fois que l'utilisateur a changé son mot de passe initial. Sert à forcer le changement de mot de passe à la première connexion
- `fichiers` (dans `NoteDeFrais`) : c'est une chaîne de texte, pas une vraie liste. On y stocke un tableau JSON sérialisé (`JSON.stringify([...])`) des chemins d'accès aux fichiers uploadés. Il faut donc le parser (`JSON.parse`) côté frontend pour l'utiliser
- `statut` : un enum à 4 valeurs qui représente l'avancement d'une note de frais (voir section 5)

## 3. Authentification

### Le flux complet

1. L'utilisateur envoie son email/mot de passe sur `POST /api/users/login`
2. Le backend vérifie le mot de passe avec `bcrypt.compare` (jamais de comparaison en clair)
3. Si c'est bon, un JWT est généré (`generateToken`) contenant `id`, `email`, `role` et `firstConnection` de l'utilisateur, signé avec une clé secrète (`JWT_SECRET`, dans `.env`), valide 10h
4. Ce token est posé dans un cookie nommé `authToken`, avec les options `httpOnly` (invisible en JavaScript côté navigateur), `sameSite: lax`, et `secure` activé uniquement en production
5. À chaque requête vers une route protégée, le token est relu (depuis le header `Authorization` ou depuis le cookie) et vérifié (`authenticateToken`, dans `Middleware/authMiddleware.js`)
6. Si le token est absent, invalide ou expiré, la route renvoie une erreur 401

### Pourquoi un cookie HttpOnly plutôt que le localStorage

Un cookie `HttpOnly` n'est pas accessible en JavaScript, même par du code malveillant injecté dans la page (faille XSS). Le `localStorage`, lui, est lisible par n'importe quel script qui s'exécute sur la page - donc plus risqué pour stocker un token d'authentification.

### Un cookie partagé entre deux ports

Le cookie est posé par le backend (port 3000) sans `Domain` précisé, donc il est rattaché au nom d'hôte `localhost` uniquement - sans distinction de port. C'est pour ça que le frontend (port 4000) peut envoyer ce cookie au backend sans configuration supplémentaire, à condition que chaque `fetch` utilise l'option `credentials: "include"`.

### Protection des pages côté frontend

Un fichier `middleware.ts` à la racine du frontend intercepte chaque navigation. S'il n'y a pas de cookie `authToken` et que la page demandée n'est pas `/login`, l'utilisateur est redirigé automatiquement.

Important : ce middleware vérifie seulement que le cookie **existe**, pas qu'il est valide (il ne décode pas la signature JWT). C'est une protection de confort de navigation, pas la vraie sécurité. La vraie sécurité reste entièrement côté backend, qui vérifie et valide le token à chaque appel API, indépendamment de ce que fait le frontend.

## 4. Sécurité

Plusieurs mécanismes de protection sont en place :

- **CORS restreint** (`Middleware/CorsMiddleware.js`) : seule l'origine définie dans `ALLOWED_ORIGIN` (le frontend) a le droit d'appeler l'API
- **Rate limiting sur le login** (`Utils/rateLimit.js`) : 5 tentatives maximum par IP toutes les 15 minutes, pour limiter le brute-force. Stocké en mémoire (une simple `Map`), donc réinitialisé si le serveur redémarre - suffisant pour un projet de cette taille, pas pour de la production à grande échelle
- **Email restreint à un domaine** (`Middleware/users/UserJoi.js` et `create_user/page.tsx`) : la création d'un compte exige un email se terminant par `@supherman.com`, vérifié à deux endroits - côté frontend (retour immédiat, sans appel réseau inutile) et côté backend (la vraie protection, contre un appel direct à l'API avec un autre domaine)
- **Validation des données avec Joi** (`Middleware/users/UserJoi.js`) : chaque formulaire (login, création de compte, note de frais) est validé côté serveur avant tout traitement, même si le frontend valide déjà côté client (jamais faire confiance uniquement au frontend)
- **Upload de fichiers sécurisé** (`app/api/users/note-frais/route.js` et `app/api/users/files/[filename]/route.js`) :
  - liste blanche de types MIME acceptés (PNG, JPEG, WEBP, PDF)
  - taille limitée à 5 Mo par fichier
  - nom de fichier généré aléatoirement (`crypto.randomUUID()`) - le nom d'origine envoyé par l'utilisateur n'est jamais utilisé comme chemin sur le disque, ce qui empêche une attaque par path traversal (ex: un nom de fichier `../../etc/passwd`)
  - les fichiers sont stockés dans `uploads/`, un dossier **hors de `public/`**, donc pas accessible directement par une URL. La seule façon de les récupérer est de passer par la route `/api/users/files/[filename]`, qui vérifie l'authentification avant de servir le fichier
- **Vérification des rôles à chaque action sensible** : créer un utilisateur, valider/refuser/traiter une note de frais - chaque route vérifie le rôle de la personne connectée avant d'exécuter l'action, pas seulement si elle est connectée

## 5. Le workflow des notes de frais

Une note de frais suit un cycle de vie précis, avec des règles de transition strictes codées dans `canChange()` (`app/api/users/update-note-statut/route.js`) :

```
CREEE ----(manager valide)----> VALIDEE ----(comptabilité traite)----> TRAITEE
  |
  '---(manager refuse)-----> REFUSEE
```

- Un **manager** peut faire passer une note de `CREEE` vers `VALIDEE` ou `REFUSEE`, et seulement depuis `CREEE`
- La **comptabilité** peut faire passer une note de `VALIDEE` vers `TRAITEE`, et seulement depuis `VALIDEE`
- Un **employé** ne peut changer aucun statut
- Toute autre combinaison (ex: manager qui essaie de passer direct à `TRAITEE`) est rejetée avec une erreur 403

La route `list-note-frais` filtre aussi ce que chaque rôle peut voir : un manager voit tout, la comptabilité voit seulement `VALIDEE` et `TRAITEE`, un employé voit seulement ses propres notes.

### Deux vues distinctes : mes notes vs toutes les notes

Le cahier des charges distingue deux pages : une liste personnelle (accessible à tous les rôles) et une liste globale de gestion (réservée manager/comptabilité). Plutôt que de dupliquer la logique, la même route `GET /api/users/list-note-frais` gère les deux cas via un paramètre de requête optionnel :

- `GET /api/users/list-note-frais` (sans paramètre) : comportement par défaut selon le rôle (manager = tout, comptabilité = validées/traitées, employé = les siennes)
- `GET /api/users/list-note-frais?mine=true` : force le filtre sur `userId`, peu importe le rôle - renvoie uniquement les notes soumises par l'utilisateur connecté

Côté frontend, le composant `ListeNotesFrais` accepte une prop `mine` :
- `<ListeNotesFrais mine />` sur la page `/mesnotes` : vue personnelle pour tous les rôles, sans colonne email, sans bouton de validation
- `<ListeNotesFrais />` sur la page `/toutes-les-notes` : vue de gestion complète, avec colonne email et actions selon le rôle - page accessible uniquement aux managers et à la comptabilité (le lien n'apparaît dans la navigation que pour ces deux rôles, dans `Barrelayout.tsx`)

## 6. Structure des dossiers

```
backend/
├── app/api/users/         # une route par fonctionnalité (login, create, note-frais, ...)
├── Middleware/
│   ├── authMiddleware.js    # vérifie le token, vérifie les rôles
│   ├── CorsMiddleware.js     # headers CORS, réponses JSON standardisées
│   └── users/UserJoi.js       # schémas de validation Joi
├── Utils/
│   ├── db.js                       # instance unique de PrismaClient
│   ├── JwtUtils.js               # génération/vérification du JWT
│   ├── authCookie.js           # pose/suppression du cookie
│   ├── errorDetails.js          # cache les détails d'erreur en production
│   └── rateLimit.js              # limite les tentatives de login
└── prisma/
    ├── schema.prisma           # modèle de données
    ├── migrations/               # historique des migrations SQL
    └── seed.js                     # crée un utilisateur manager de test

frontend/
├── app/
│   ├── login/, home/, profil/, ...   # une page par route
│   ├── mesnotes/                              # vue personnelle (ListeNotesFrais mine)
│   ├── toutes-les-notes/                  # vue de gestion, manager/comptabilité (ListeNotesFrais)
│   └── component/                          # composants réutilisables (formulaires, layout, alertes)
├── app/lib/api.ts                            # adresse de l'API backend, centralisée
└── middleware.ts                             # protège l'accès aux pages
```

## 7. Limites connues et pistes d'amélioration

- Le rate limiting est en mémoire : il ne fonctionnerait pas correctement si l'app tournait sur plusieurs serveurs en même temps (il faudrait un store partagé comme Redis)
- Le `middleware.ts` du frontend vérifie juste la présence du cookie, pas sa validité - un cookie expiré ou corrompu ne bloquerait pas l'accès à la page (mais bloquerait bien les appels API ensuite, donc la donnée reste protégée)
- Pas de tests automatisés sur ce projet pour l'instant
- Les fichiers uploadés restent sur le disque du serveur (pas de service de stockage externe type S3) - fonctionne bien en local, à revoir si le projet est déployé sur plusieurs instances
