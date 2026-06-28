# Ignitor — Bruno collection

Manual, interactive exploration of the Ignis FHIR API, kept in the repo as
[Bruno](https://www.usebruno.com/) files. This is a dev tool for poking at a
running server by hand — automated coverage lives in the `Ignis.Api.Tests`
integration tests (`WebApplicationFactory` + Mongo), not here.

## Setup

1. Open the collection in Bruno: **Open Collection** → point at this `eng/bruno`
   folder.
2. Select the **local** environment (top-right in Bruno).
3. Set the client secret: open the environment editor and fill in `clientSecret`.
   It's a Bruno *secret variable*, so its value stays in Bruno's local store and
   is never written to the committed files. The dev value matches the
   `ignis-client` client in `appsettings.json`.
4. Disable TLS verification for the collection (Settings → SSL/TLS Certificate
   Verification) — the dev cert is self-signed.
5. Run the API (`dotnet run`), then run **Auth → Get token** before other requests.

## Auth

Run **Auth → Get token** once: its post-response script stores the access token in
the `accessToken` runtime variable, and every request inherits
`Bearer {{accessToken}}` from the collection. Re-run it when the token expires
(requests start returning 401). `clientId` lives in the committed `local`
environment; `clientSecret` is a secret variable (see Setup), so no credentials
are committed.

> Bruno's built-in collection OAuth2 didn't reliably attach the token here, so the
> collection uses an explicit Bearer token fed by the Get token request instead.

## Scopes

Most requests (CRUD, search, `$validate`, `metadata`, `$everything`, `$meta`) only
need an authenticated user — no scope. A few are scope-gated:

| Request | Scope | Also needs |
| --- | --- | --- |
| Maintenance → Rebuild index | `maintenance/database.write` | — |
| Maintenance → Clear store | `maintenance/database.destructive` | `AllowClearStore` flag |
| Import → Archive import (+ limits) | `operations.import` | `AllowImport` flag |

The default token carries no scopes, so these return `403` until you fetch a
scoped token. Two steps:

1. **Grant the scopes to the dev client** — OpenIddict only issues scopes a client
   is allowed. Add to `appsettings.local.json`:

   ```json
   "AuthSettings": {
     "Clients": [
       {
         "ClientId": "ignis-client",
         "ClientSecret": "replace-this-secret",
         "AllowedGrantTypes": ["client_credentials"],
         "AllowedScopes": [
           "maintenance/database.write",
           "maintenance/database.destructive",
           "operations.import"
         ]
       }
     ]
   }
   ```

2. **Request them**: add a `scope` line to the **Get token** body
   (`body:form-urlencoded`), space-separated — e.g.
   `scope: maintenance/database.write operations.import` — and re-run Get token.
   The stored `accessToken` now carries those scopes.

Without the grant, the scoped token request fails with `invalid_scope`; without
the feature flag, the operation returns `404`/`503`.

## HTTPS

The `local` environment targets `https://localhost:5201` for both `baseUrl` and
`tokenUrl`. Keep them on the same origin — mixing `http`/`https` triggers an HTTPS
redirect that drops the `Authorization` header (→ 401). TLS verification must be
off for the collection (self-signed dev cert; see Setup step 4).
