# Backend TODOs

Things the frontend wants but cannot do yet. Listed in rough
priority order.

## 1. Routes for per-user data

The User model already has `favoriteRestaurants`,
`personalNotes`, and `moods` subdocuments, and `user-service.js`
already has `addFavoriteRestaurant`, `addPersonalNote`, and
`addMood`. None of those are exposed as routes yet, so the
frontend keeps favorites/notes/moods in local state and loses
them on refresh.

Routes we need:

- `GET /users/me` — returns the authenticated user with
  favorites, personalNotes, and moods populated. Use
  `findUserById(req.user.id)`.
- `POST /users/me/favorites/:restaurantId` — add to favorites.
  Use existing `addFavoriteRestaurant`.
- `DELETE /users/me/favorites/:restaurantId` — remove from
  favorites. New service function needed (e.g.
  `removeFavoriteRestaurant` using `$pull`).
- `POST /users/me/notes` body `{ restaurantId, note }` — add a
  personal note. Use existing `addPersonalNote`.
- `PUT /users/me/notes/:noteId` body `{ note }` — edit a note.
  New service function.
- `DELETE /users/me/notes/:noteId` — delete a note. New service
  function.
- `POST /users/me/moods` body `{ restaurantId, mood }` — add a
  mood. Use existing `addMood`.
- `DELETE /users/me/moods/:moodId` — remove a mood. New service
  function.

All of these should use the `authenticateUser` middleware and
read the user from `req.user.id`.

## 2. Schema question

Are `mood` and `notes` always per-user (current model), or
should the Restaurant itself carry an owner-set `mood: [String]`
and `notes: String` too? The frontend currently treats them as
per-restaurant fields. If they should stay per-user only, the
row buttons in the table need to talk to the per-user endpoints
above.

If we add them to the Restaurant schema, the changes would be:

- `mood: [{ type: String, trim: true }]`
- `notes: { type: String, trim: true, default: "" }`

And `POST /restaurants` / the upload route would need to accept
them.

## 3. Restaurant shape mismatch

The frontend uses `price` (1-4), `rating`, `reviews`,
`occasions` (array), and the backend uses `priceRange` (string),
`reviewStars`, `reviewCount`, `averagePriceSpent`, `occasion`
(single string). The frontend now has an adapter in
`restaurantAdapter.js` that translates both ways, but it would
be cleaner if both sides agreed on one shape eventually.

Suggested target shape (matches frontend more naturally):

- `price: Number` 1-4 instead of `priceRange: String`
- `rating: Number` instead of `reviewStars`
- `reviews: Number` instead of `reviewCount`
- `occasions: [String]` instead of `occasion: String`

This is not blocking — the adapter handles it for now.

## 4. CORS in production

`app.use(cors())` allows any origin. Tighten to the deployed
frontend URL before going to prod.

## 5. Missing dependencies

Spotted while wiring up the frontend:

- `auth.js` imports `jsonwebtoken` but it is not listed in
  `packages/express-backend/package.json`.
- `services/user-service.js` imports from `bcrypt` but the
  declared dependency is `bcryptjs`. Either change the import to
  `import bcrypt from "bcryptjs"` or swap the dependency to
  `bcrypt`.

After fixing both, run `npm install` so the backend can actually
start.

Also `.env` in `packages/express-backend` currently only has
`MONGODB_URI`. `TOKEN_SECRET` is referenced in `auth.js` but
missing — signup and login will throw without it.

## 6. Token expiry handling

Tokens expire in 1 day. The frontend currently treats a 401 from
a protected route as a generic error. A `/users/refresh` route
or a refresh-token flow would be nice. Low priority.
