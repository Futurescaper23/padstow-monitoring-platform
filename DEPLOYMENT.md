# Deployment Notes

## Recommended path

For this version of the app, the cleanest route is:

1. Create a GitHub repository
2. Push the full `future-monitoring-system` folder into it
3. Deploy the repo to `Render` as a Node web service

This is preferred over Netlify because the app currently depends on:

- a running Node server
- writable files in `survey-data/`
- writable metadata in `data/projects.json`
- server routes for weather and tides

## Before pushing

Make sure these are present in the repo:

- `index.html`
- `styles.css`
- `app.js`
- `server.js`
- `data/`
- `survey-data/`
- `shared-data/`
- `docs/`
- `package.json`
- `render.yaml`
- `.env.example`

## GitHub

If the folder is not already a Git repo:

```powershell
cd "G:\My Drive\Futurescaping\CODEX\future-monitoring-system"
git init
git add .
git commit -m "Prepare FutureScaping monitoring system for deployment"
```

Then create the GitHub repo and push:

```powershell
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

## Render

In Render:

1. Create a new `Web Service`
2. Connect the GitHub repository
3. Let Render read `render.yaml`, or set manually:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add a persistent disk for report logins:
   - Mount path: `/var/data`
   - Size: `1 GB` is enough for login storage
5. Set environment variables:
   - `ADMIN_USERNAME=admin`
   - `ADMIN_PASSWORD`
   - `ACCESS_USERS_PATH=/var/data/access-users.json`
   - `WORLDTIDES_API_KEY`
6. Deploy

For an existing manually created Render web service, add the persistent disk in the Render Dashboard first, then set `ACCESS_USERS_PATH` in that same service's environment settings.

## Important note about writable data

This app currently writes uploads and metadata changes back into local files.

That works well locally, but on a hosted service it means:

- uploaded files may not persist the way you expect between deploys or restarts
- data written on the server is not a long-term database solution

So for the first live version, the safest pattern is:

- treat deployment as a presentation / review environment
- keep your master data in the project files locally
- redeploy updated files from source control as needed

## Report login persistence

The client-facing report usernames and passwords are stored in `access-users.json`.

Without a persistent disk on Render, that file lives on the service's ephemeral filesystem, which means created report logins can disappear when the service redeploys or restarts.

To preserve those logins across deploys:

- attach a Render persistent disk
- mount it at `/var/data`
- set `ACCESS_USERS_PATH=/var/data/access-users.json`

With that in place:

- `ADMIN_PASSWORD` continues to live in Render environment variables
- created report logins persist across redeploys
- active sessions still reset when the service restarts, so users may need to sign in again

If the clients later need true live editing and persistent uploads, the next step would be moving those writes into proper cloud storage / a database.
