# Panneau d'Administration - Gestion de Produits et Clients (Test Biloki)

## 📋 Contexte du Projet
Ce projet est une application web développée dans le cadre d'un test technique pour **Biloki**. Il s'agit d'un panel administrateur destiné à la gestion interne de :
- Produits
- Stocks de produits
- Clients

*Conformément aux consignes, la gestion des commandes n'est pas incluse.*

---

## 🛠️ Stack Technique & Architecture

L'architecture repose sur une approche monolithique moderne. **Inertia.js** est utilisé pour faire le pont directement entre le backend Laravel et le frontend React, éliminant ainsi le besoin de développer une API REST complexe, tout en offrant une expérience SPA (Single Page Application) fluide.

- **Backend :** Laravel (PHP) packagé avec **Composer**
- **Frontend :** React.js
- **Routage & State Management :** Inertia.js
- **Authentification & Starter Kit :** Laravel Breeze (version React/Inertia)
- **Gestion des Rôles & Permissions :** Spatie Laravel Permission (pour sécuriser le panel admin)
- **Stylisation :** Tailwind CSS

---

## 🗄️ Base de Données (Schéma)

La base de données relationnelle est structurée autour de trois domaines principaux.

### 1. Utilisateurs & Permissions (Spatie)
- `users` : `id`, `name`, `email`, `password`, `remember_token`, `timestamps`
- Les tables générées par le package **Spatie** (`roles`, `permissions`, `model_has_roles`, etc.) pour restreindre l'accès à la partie administration.

### 2. Produits & Stock
- `products`
  - `id` (Primary Key)
  - `name` (VARCHAR) : Nom du produit
  - `description` (TEXT) : Description détaillée
  - `price` (DECIMAL) : Prix unitaire
  - `stock_quantity` (INT) : Quantité disponible en stock
  - 'photoUrl' (TEXT) : lien d'image de produit
  - `timestamps`

### 3. Clients
- `clients`
  - `id` (Primary Key)
  - `first_name` (VARCHAR) : Prénom du client
  - `last_name` (VARCHAR) : Nom du client
  - `email` (VARCHAR) : Adresse email (Unique)
  - `phone` (VARCHAR) : Numéro de téléphone (Nullable)
  - `address` (TEXT) : Adresse postale (Nullable)
  - `timestamps`

---

## 📂 Architecture des Dossiers

Voici l'organisation des principaux dossiers et fichiers à respecter tout au long du développement du projet :

```text
📦 ManageProductTest
 ┣ 📂 app
 ┃ ┣ 📂 Http
 ┃ ┃ ┣ 📂 Controllers   # Logique métier (ProductController, ClientController)
 ┃ ┃ ┣ 📂 Middleware    # Middleware Inertia (HandleInertiaRequests) et Permissions
 ┃ ┃ ┗ 📂 Requests      # FormRequests pour la validation (ex: StoreProductRequest)
 ┃ ┗ 📂 Models          # Modèles Eloquent (User, Product, Client)
 ┣ 📂 database
 ┃ ┣ 📂 migrations      # Fichiers de création des tables
 ┃ ┗ 📂 seeders         # Fichiers d'injection des données de test
 ┣ 📂 resources
 ┃ ┣ 📂 css
 ┃ ┃ ┗ 📜 app.css       # Directives Tailwind CSS
 ┃ ┗ 📂 js
 ┃   ┣ 📂 Components    # Composants React réutilisables (Inputs, Modales, Tables)
 ┃   ┣ 📂 Layouts       # Layout du Panel Administrateur (Sidebar, Navbar)
 ┃   ┣ 📂 Pages         # Pages de l'application (ex: Products/Index, Clients/Create)
 ┃   ┗ 📜 app.jsx       # Point d'entrée principal (Configuration Inertia + React)
 ┣ 📂 routes
 ┃ ┗ 📜 web.php         # Définition des routes et protection via middlewares
 ┗ 📜 tailwind.config.js # Configuration des styles et couleurs Tailwind
```

---

## ⚙️ Configuration d'Inertia.js

Inertia.js agit comme un "ciment" entre Laravel et React. Sa configuration se divise en deux parties principales :

### 1. Côté Backend (Laravel)
Lors de l'installation de Breeze avec React, un middleware `HandleInertiaRequests.php` est généré dans `app/Http/Middleware/`.
C'est ici que l'on configure les **données globales (shared data)** partagées avec toutes les pages React, comme :
- Les informations de l'utilisateur actuellement connecté.
- Les rôles et permissions de l'utilisateur (via Spatie) pour conditionner l'affichage des boutons dans React.
- Les messages "Flash" (ex: "Produit ajouté avec succès").

Exemple dans `HandleInertiaRequests.php` :
```php
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user(),
            // Partage des permissions pour le frontend
            'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name') : [],
        ],
        'flash' => [
            'message' => fn () => $request->session()->get('message')
        ],
    ]);
}
```

### 2. Côté Frontend (React)
L'initialisation se fait dans `resources/js/app.jsx`. Inertia s'occupe de résoudre le composant de la page demandée et de l'injecter dans la div `#app` du fichier `resources/views/app.blade.php`.
Il est également responsable de la configuration de Vite.js pour recharger automatiquement les composants lors du développement (HMR).

---

## 🚀 Guide d'Installation (De A à Z)

### Prérequis
Assurez-vous que votre environnement local dispose des éléments suivants :
- **PHP** >= 8.1
- **Composer** (Gestionnaire de paquets PHP)
- **Node.js** & **NPM** (Gestionnaire de paquets JavaScript)
- Un serveur de base de données (MySQL, MariaDB, PostgreSQL ou SQLite)

### Étapes d'installation 



**1. Cloner ou initialiser le projet**
Placez-vous dans le répertoire de votre choix et récupérez le projet :
```bash
git clone <url-du-repo>
# ou si vous avez l'archive, décompressez-la.
cd nom-du-projet
```

**2. Installer les dépendances Backend (PHP)**
```bash
composer install
```

**3. Installer les dépendances Frontend (JavaScript)**
```bash
npm install
```

**4. Configuration de l'environnement**
Dupliquez le fichier de configuration d'environnement par défaut :
```bash
cp .env.example .env
```
Ouvrez ensuite le fichier `.env` nouvellement créé et mettez à jour les accès à votre base de données :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nom_de_votre_base_de_donnees
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

**5. Générer la clé d'application Laravel**
```bash
php artisan key:generate
```

**6. Création des tables et injection des fausses données**
Exécutez les migrations pour générer la structure de la base de données, et les seeders pour créer un compte Administrateur par défaut ainsi que des données de test (produits, clients).
```bash
php artisan migrate --seed
```

**7. Lancer l'environnement de développement**
Pour que le projet fonctionne localement, il faut faire tourner simultanément le serveur PHP et le serveur de compilation front-end (Vite). Ouvrez deux terminaux à la racine du projet.

*Dans le Terminal 1 (Serveur Backend) :*
```bash
php artisan serve
```

*Dans le Terminal 2 (Compilation Frontend) :*
```bash
npm run dev
```

L'application est maintenant accessible depuis votre navigateur à l'adresse : **http://localhost:8000**
Vous pouvez vous connecter au Panel Administrateur avec le compte généré lors du seeding de la base de données.
