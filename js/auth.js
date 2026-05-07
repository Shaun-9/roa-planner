const AuthClient = (() => {
  const MSAL_CDN = "https://cdn.jsdelivr.net/npm/@azure/msal-browser@2/dist/msal-browser.min.js";

  let msalInstance = null;
  let msalReady = null;

  function loadMsal() {
    if (msalReady) return msalReady;
    if (typeof msal !== "undefined") {
      msalReady = Promise.resolve();
      return msalReady;
    }
    msalReady = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = MSAL_CDN;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load MSAL.js. Check your network connection."));
      document.head.appendChild(script);
    });
    return msalReady;
  }

  function createInstance() {
    const msalConfig = {
      auth: {
        clientId: APP_CONFIG.SP_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${APP_CONFIG.SP_TENANT_ID}`,
        redirectUri: window.location.href.split("?")[0]
      },
      cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
      }
    };
    msalInstance = new msal.PublicClientApplication(msalConfig);
  }

  async function getToken() {
    if (APP_CONFIG.DATA_SOURCE !== "sharepoint") return null;

    await loadMsal();
    if (!msalInstance) createInstance();

    const scopes = ["https://graph.microsoft.com/Sites.Read.All"];
    const accounts = msalInstance.getAllAccounts();

    if (accounts.length > 0) {
      try {
        const response = await msalInstance.acquireTokenSilent({ scopes, account: accounts[0] });
        return response.accessToken;
      } catch (e) {
        // Silent failed — fall through to popup
      }
    }

    const response = await msalInstance.acquireTokenPopup({ scopes });
    return response.accessToken;
  }

  return { getToken };
})();
