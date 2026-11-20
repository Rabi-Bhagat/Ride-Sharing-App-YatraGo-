const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GIS_SCRIPT_ID = 'yatrago-google-identity';

let scriptPromise = null;
let configPromise = null;

export class GoogleAuthError extends Error {
  constructor(message, code = 'google_auth_failed') {
    super(message);
    this.name = 'GoogleAuthError';
    this.code = code;
  }
}

function loadGoogleScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new GoogleAuthError('Google sign-in is only available in the browser.', 'unsupported'));
  }
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (window.google?.accounts?.oauth2) {
        resolve();
      } else {
        scriptPromise = null;
        reject(new GoogleAuthError('Google sign-in library failed to initialise.', 'script_failed'));
      }
    };

    const existing = document.querySelector(`script[src="${GIS_SCRIPT_SRC}"], script#${GIS_SCRIPT_ID}`);
    if (existing) {
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => {
        scriptPromise = null;
        reject(new GoogleAuthError('Could not load Google sign-in. Check your connection.', 'script_failed'));
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GIS_SCRIPT_ID;
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = finish;
    script.onerror = () => {
      scriptPromise = null;
      reject(new GoogleAuthError('Could not load Google sign-in. Check your connection.', 'script_failed'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function getGoogleClientId() {
  if (!configPromise) {
    configPromise = fetch('/api/auth/google/config')
      .then(res => res.json())
      .catch(() => null);
  }

  const config = await configPromise;
  if (!config || !config.success || !config.configured || !config.clientId) {
    configPromise = null;
    throw new GoogleAuthError(
      'Google sign-in is not configured on this server yet. Add GOOGLE_CLIENT_ID to your .env file.',
      'not_configured'
    );
  }
  return config.clientId;
}

// Warms up the client ID and the Google script so clicking the button can open the
// popup while the click's user gesture is still fresh (popups otherwise get blocked).
export function preloadGoogleAuth() {
  getGoogleClientId()
    .then(() => loadGoogleScript())
    .catch(() => {});
}

// Opens Google's real account chooser and resolves with an access token for whichever
// Google account the person picked. Rejects if they close the popup or Google errors.
export async function requestGoogleAccessToken() {
  const clientId = await getGoogleClientId();
  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      fn(value);
    };

    let tokenClient;
    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: (response) => {
          const token = response?.access_token;
          if (token) {
            settle(resolve, token);
          } else if (response?.error === 'access_denied') {
            settle(reject, new GoogleAuthError('Google sign-in was cancelled.', 'cancelled'));
          } else {
            settle(reject, new GoogleAuthError('Google did not return a session. Please try again.', 'no_token'));
          }
        },
        error_callback: (err) => {
          if (settled) return;
          if (err?.type === 'popup_closed' || err?.type === 'popup_closed_by_user') {
            settle(reject, new GoogleAuthError('Google sign-in window was closed.', 'cancelled'));
          } else if (err?.type === 'popup_failed_to_open') {
            settle(reject, new GoogleAuthError('Your browser blocked the Google popup. Allow popups and retry.', 'popup_blocked'));
          } else {
            settle(reject, new GoogleAuthError(err?.message || 'Google sign-in failed. Please try again.', 'popup_error'));
          }
        }
      });
    } catch (err) {
      settle(reject, new GoogleAuthError('Could not start Google sign-in. Please try again.', 'init_failed'));
      return;
    }

    tokenClient.requestAccessToken();
  });
}
