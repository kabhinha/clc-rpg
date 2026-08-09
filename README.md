# CLC 270+ RPG — v3 Dynamic Calendar Edition

## Major upgrade
The app can now pull monthly revision events directly from Google Calendar.

### Calendar sync model
- OAuth runs in the browser using Google Identity Services.
- Scope requested: `calendar.events.readonly`.
- The app NEVER needs your Google password.
- Access tokens are kept in memory, not saved to localStorage.
- Imported events populate the app's Revision Quest schedule.
- Google events themselves are not edited/deleted.

### Why a Google OAuth Client ID is required
A browser app needs its own Web OAuth client identity. Create one in Google Cloud, enable Google Calendar API,
and add the final GitHub Pages origin to Authorized JavaScript origins.

## GitHub Pages
This repo includes `.github/workflows/deploy.yml`.
In GitHub → Settings → Pages, choose **GitHub Actions** as the source. Every push to `main` deploys automatically.

## Data
Your RPG progress still lives in browser localStorage. Export backups from the Stats tab.
