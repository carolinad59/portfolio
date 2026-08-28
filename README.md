# Caroline Darche-Olsson — CV interactif

Portfolio / CV web pour Caroline Darche-Olsson, technicienne et ingénieure en
biologie moléculaire et cellulaire qui développe aussi ses propres outils web
pour l'analyse de données scientifiques.

Site statique en **HTML, CSS et JavaScript vanilla**, sans framework ni étape
de build.

## Structure

```
index.html          Contenu et structure de la page
css/style.css        Design system (tokens clair/sombre), mise en page, responsive
js/script.js         Thème clair/sombre, navigation mobile, accordéon du parcours,
                      filtre du portfolio, animations au scroll, etc.
assets/               Photo de profil, CV en PDF, favicon
```

## Développement local

Aucune installation n'est nécessaire. Le plus simple est d'utiliser
l'extension **Live Server** dans VS Code :

1. Ouvrir ce dossier dans VS Code.
2. Installer l'extension *Live Server* (Ritwick Dey) si besoin.
3. Clic droit sur `index.html` → **Open with Live Server** (ou cliquer sur
   *Go Live* en bas à droite).
4. Le site s'ouvre sur `http://127.0.0.1:5500` avec rechargement automatique.

Alternative sans extension :

```bash
python -m http.server 5500
```

puis ouvrir `http://localhost:5500`.

## Déploiement sur GitHub Pages

1. Créer un dépôt GitHub et y pousser ce dossier (`index.html` à la racine).
2. Dans le dépôt : **Settings → Pages → Source**, choisir la branche
   `main` et le dossier `/ (root)`.
3. Le site est publié sur `https://<utilisateur>.github.io/<depot>/`.

## À personnaliser

- Le lien GitHub de la section Contact pointe vers `github.com/exadex`
  (l'organisation qui héberge les deux projets en ligne) — à remplacer par
  un profil GitHub personnel si besoin, dans `index.html`.
