# POSEY Node Backend

Backend Express/MongoDB genere a partir du projet Django POSEY.

## Architecture

- `src/models` : schemas Mongoose
- `src/routes` et `src/views` : routes Express, alias `views` pour respecter MVC
- `src/controllers` : logique HTTP
- `src/repositories` : acces aux donnees
- `src/services` : logique metier
- `src/utils` : helpers reutilisables
- `src/middlewares` : auth, erreurs, upload
- `src/config` : MongoDB, environnement, Swagger

## Demarrage

```bash
npm install
copy .env.example .env
npm run dev
```

API : `http://localhost:5000/api`
Swagger : `http://localhost:5000/api/docs`

Les prefixes Django conserves : `/api/user`, `/api/prestation`, `/api/commande`, `/api/portefeuille`, `/api/note`, `/api/service`.
