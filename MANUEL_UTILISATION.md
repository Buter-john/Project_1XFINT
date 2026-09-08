# Manuel d'utilisation - Sup Herman

Ce document explique comment utiliser l'application selon le rôle de la personne connectée. Il y a trois rôles : Employé, Manager, Comptabilité.

## Se connecter

Sur la page de connexion, entre ton email et ton mot de passe, puis clique sur "Se connecter".

Si c'est ta toute première connexion, tu seras redirigé vers une page de changement de mot de passe obligatoire. Tu dois entrer ton mot de passe actuel (celui qu'on t'a donné) et choisir un nouveau mot de passe d'au moins 8 caractères. Une fois validé, tu arrives sur la page d'accueil.

Si tu te trompes trop de fois de mot de passe (5 tentatives), tu devras attendre 15 minutes avant de pouvoir réessayer.

## Page d'accueil

Une fois connecté, tu arrives sur une page avec deux choix :
- **Nouvelle note de frais** : pour soumettre une dépense
- **Consulter mes notes** : pour voir l'état de tes notes de frais

En haut de chaque page, une barre de navigation te permet d'aller sur "Mes notes", sur ton profil, de te déconnecter, et (si tu es manager ou comptabilité) d'accéder à "Toutes les notes" ou (si tu es manager) de créer un nouvel utilisateur.

Il y a deux pages différentes pour consulter des notes de frais, à ne pas confondre :
- **Mes notes** : toujours tes propres notes à toi, quel que soit ton rôle. Pas de bouton de validation ici, juste un suivi.
- **Toutes les notes** : visible seulement par les managers et la comptabilité, affiche les notes de tout le monde avec les boutons d'action.

## Employé

### Créer une note de frais

1. Clique sur "Nouvelle note de frais" depuis l'accueil
2. Remplis un titre (par exemple "Déjeuner client") et un commentaire décrivant la dépense
3. Clique sur la zone de fichiers pour joindre un ou plusieurs justificatifs (PDF, PNG, JPG ou WEBP, 5 Mo max par fichier)
4. Clique sur "Soumettre"

Ta note apparaît alors avec le statut "Créée", en attente de validation par un manager.

### Suivre mes notes

Depuis "Consulter mes notes", tu vois la liste de toutes tes notes avec leur statut :
- **Créée** : en attente de validation
- **Validée** : acceptée par un manager, en attente de traitement par la comptabilité
- **Refusée** : refusée par un manager
- **Traitée** : le remboursement a été traité par la comptabilité

Clique sur "Voir" pour afficher le détail d'une note (commentaire complet, justificatifs).

## Manager

Le manager a accès à toutes les mêmes fonctionnalités qu'un employé (créer et consulter ses propres notes), plus deux choses en plus :

### Créer un utilisateur

Depuis le menu en haut, clique sur "Créer un utilisateur". Renseigne un email, un mot de passe temporaire, et choisis le rôle (Employé, Manager ou Comptabilité). La personne créée devra changer ce mot de passe temporaire à sa première connexion.

### Valider ou refuser une note de frais

Depuis "Toutes les notes" (pas "Mes notes" - cette page-là ne montre que tes propres notes), tu vois les notes de **tous** les employés. Chaque note au statut "Créée" a deux boutons :
- **Valider** : la note passe au statut "Validée"
- **Refuser** : la note passe au statut "Refusée"

Une fois qu'une note est validée ou refusée, tu ne peux plus revenir en arrière depuis l'interface.

## Comptabilité

Depuis "Toutes les notes", la comptabilité voit uniquement les notes qui ont été **validées** ou déjà **traitées** (les notes "Créée" ou "Refusée" ne sont pas affichées).

Pour chaque note "Validée", un bouton "Marquer comme traitée" permet de faire passer la note au statut "Traitée" une fois le remboursement effectué.

Comme les autres rôles, la comptabilité a aussi accès à "Mes notes" si elle a besoin de soumettre ses propres notes de frais.

## Se déconnecter

Clique sur "Déconnexion" en haut à droite. Tu seras redirigé vers la page de connexion, et tu ne pourras plus accéder aux autres pages tant que tu ne te reconnectes pas.
