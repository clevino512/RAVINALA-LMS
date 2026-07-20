- [Aperçu du projet](#-aperçu-du-projet)
- [Architecture technique](#-architecture-technique)
- [Stack technologique](#-stack-technologique)
- [Structure du dépôt](#-structure-du-dépôt)
- [Configuration & Installation](#-configuration--installation)
- [Variables d'environnement](#-variables-denvironnement)
- [Scripts disponibles](#-scripts-disponibles)
- [Règles de contribution](#-règles-de-contribution)
- [Standards de code](#-standards-de-code)
- [Sécurité](#-sécurité)
- [Tests](#-tests)
- [Licence](#-licence)

---

## 🧭 Aperçu du projet

Cette application permet à un établissement de gérer :

- **3 rôles utilisateurs** : administrateur, enseignant, étudiant
- **Des cours structurés** en modules/leçons avec progression forcée
- **Des évaluations** : quiz anti-triche et dépôt de devoirs (PDF, vidéo, images)
- **Un forum de collaboration** modéré par cours
- **Des tableaux de bord statistiques** (Chart.js)

---

##  Architecture technique

L'application adopte une **architecture monolithique moderne** : un seul projet Laravel sert à la fois la logique métier et le rendu des pages, via **Inertia.js**. Cela élimine le besoin d'une API REST séparée et d'un frontend découplé, tout en conservant une expérience SPA fluide.


##  Stack technologique

- **Backend** : PHP 8.2+, Laravel 11, Eloquent ORM
- **Authentification** : Laravel Breeze (stack Inertia)
- **Frontend intégré** : Inertia.js, Vue 3, Vite
- **Base de données** : MySQL 8
- **Graphiques** : Chart.js (via composants Vue)
- **Files d'attente** : Laravel Queue (driver database)
- **Emails** : Laravel Mail (SMTP / SendGrid / Mailgun)

---

##  Structure du dépôt

```
projet-elearning/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/                 # Fourni par Breeze
│   │   │   ├── CourseController.php
│   │   │   ├── QuizController.php
│   │   │   ├── AssignmentController.php
│   │   │   ├── ForumController.php
│   │   │   └── DashboardController.php
│   │   ├── Requests/                 # FormRequests (validation)
│   │   └── Middleware/
│   ├── Models/
│   ├── Policies/                     # RBAC admin/enseignant/étudiant
│   └── Jobs/                         # Rappels email, traitement vidéo
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   ├── js/
│   │   ├── Pages/                    # Pages Inertia (Vue 3)
│   │   │   ├── Auth/
│   │   │   ├── Courses/
│   │   │   ├── Quizzes/
│   │   │   ├── Assignments/
│   │   │   ├── Forum/
│   │   │   └── Dashboard/
│   │   ├── Components/               # Composants Vue réutilisables
│   │   ├── Layouts/
│   │   └── app.js
│   └── views/app.blade.php           # Point d'entrée Inertia
├── routes/
│   └── web.php
├── storage/
│   └── app/                          # Vidéos, PDF, devoirs
├── tests/
│   ├── Feature/
│   └── Unit/
├── docs/
│   └── swagger.yaml                  # Documentation des routes internes (optionnel)
├── .env.example
└── README.md
```

---

## ⚙️ Configuration & Installation

### Prérequis

- PHP >= 8.2, Composer >= 2.6
- Node.js >= 20 (requis uniquement pour compiler les assets Vite/Vue, aucun serveur Node en production)
- MySQL >= 8
- React Typescript

### Installation locale

```bash
# 1. Cloner le dépôt
git clone https†********

# 2. Installer les dépendances PHP
composer install

# 3. Configurer l'environnement
cp .env.example .env
php artisan key:generate

# 4. Configurer la base de données dans .env, puis migrer
php artisan migrate --seed

# 5. Installer Breeze (si non déjà scaffoldé)
composer require laravel/breeze --dev
php artisan breeze:install vue
# Choisir "Vue" comme stack Inertia, avec options "Dark mode" et "Tests" selon besoin

# 6. Installer les dépendances front (Vite/Vue) et compiler
npm install
npm run dev        # développement
# npm run build     # production

# 7. Lancer le serveur Laravel
php artisan serve
```

---

## 🔐 Variables d'environnement

**.env**
```env
APP_NAME="E-Learning Platform"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=elearning
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database

FILESYSTEM_DISK=local
MAX_VIDEO_UPLOAD_MB=500
MAX_ASSIGNMENT_UPLOAD_MB=100

MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=
MAIL_FROM_ADDRESS="no-reply@elearning.local"
MAIL_FROM_NAME="${APP_NAME}"

VITE_APP_NAME="${APP_NAME}"
```

> ⚠️ Le fichier `.env` ne doit jamais être commité. Utiliser `.env.example` comme modèle partagé sans valeurs sensibles.

---

## 📜 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `php artisan serve` | Démarre le serveur de développement Laravel |
| `php artisan migrate --seed` | Applique les migrations et les données de test |
| `php artisan migrate:fresh --seed` | Réinitialise complètement la base de données |
| `php artisan queue:work` | Traite les files d'attente (emails, tâches asynchrones) |
| `php artisan test` | Exécute la suite de tests PHPUnit/Pest |
| `php artisan pint` | Formate le code PHP selon PSR-12 |
| `npm run dev` | Démarre Vite en mode développement (hot reload) |
| `npm run build` | Compile les assets Vue/Inertia pour la production |

---

## 🤝 Règles de contribution

### Workflow Git (Git Flow simplifié)

- `main` : code en production, protégé, déploiement automatique
- `develop` : intégration continue, base de toutes les branches de fonctionnalité
- `feature/<module>-<nom-fonctionnalité>` : ex. `feature/quiz-questions-aleatoires`
- `fix/<nom-du-bug>` : correctifs
- `hotfix/<nom>` : correctifs urgents sur `main`

### Convention de nommage des commits (Conventional Commits)

```
<type>(<scope>): <description courte>

Types autorisés : feat, fix, docs, style, refactor, perf, test, chore
Exemples :
  feat(auth): ajout du changement de mot de passe obligatoire (Breeze)
  fix(assignments): correction de la validation de taille de fichier
  docs(readme): mise à jour de la configuration Breeze/Inertia
```

### Processus de Pull Request

1. Créer une branche depuis `develop`
2. Développer + tests unitaires/fonctionnels associés obligatoires
3. Vérifier le linting (`php artisan pint --test`) et les tests (`php artisan test`)
4. Ouvrir une PR vers `develop` avec description claire (contexte, changements, captures d'écran si UI Inertia)
5. **Revue de code obligatoire par au moins un autre développeur**
6. CI (tests + lint) doit passer au vert avant tout merge
7. Squash & merge uniquement, jamais de merge commit brut

### Règles générales

- Aucun push direct sur `main` ou `develop`
- Toute variable sensible passe par `.env`, jamais commitée
- Toute nouvelle route doit être protégée par un middleware d'authentification/rôle explicite
- Toute fonctionnalité touchant à l'authentification ou aux permissions (Policies) nécessite une revue de sécurité additionnelle
- Les pages Inertia doivent recevoir leurs données uniquement via les `props` du contrôleur, jamais via appel API externe côté client

---

---

## Sécurité

- Authentification et changement de mot de passe obligatoire via **Laravel Breeze**
- Hashage des mots de passe (bcrypt, configuration par défaut Laravel)
- Autorisation par **Policies** pour chaque ressource (cours, quiz, devoirs, forum)
- Protection CSRF native (tokens gérés automatiquement par Inertia/Breeze)
- Validation stricte des entrées via `FormRequest`, protection contre l'injection SQL (Eloquent ORM paramétré)
- Limitation stricte du type et de la taille des fichiers uploadés (vidéos 500 Mo, devoirs 100 Mo) via règles de validation `mimes` et `max`
- Journalisation des actions sensibles (connexions, suppressions, modifications de notes) via les logs Laravel

---

##  Tests

| Type | Outil | Emplacement |
|------|-------|-------------|
| Tests unitaires | PHPUnit / Pest | `tests/Unit` |
| Tests fonctionnels (routes, contrôleurs) | PHPUnit / Pest | `tests/Feature` |
| Tests de permissions (Policies) | PHPUnit / Pest | `tests/Feature/Policies` |
| Tests End-to-End | Cypress ou Playwright (optionnel) | `tests/e2e` |

```bash
php artisan test
php artisan test --filter=QuizTest
php artisan test --coverage


