import { PublicClientApplication } from "@azure/msal-browser";
import { Client, AuthenticationProvider } from "@microsoft/microsoft-graph-client";

const msalConfig = {
  auth: {
    clientId: "3adafcfc-d142-43d6-9281-ea1985504f68",
    authority: "https://login.microsoftonline.com/d60c5d25-56f2-4940-9d64-9cb21b6bee16",
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

// Acquire an access token
const loginRequest = {
  scopes: ["openid", "profile", "Notes.Read", "Notes.ReadWrite"], // Add any additional scopes as needed
};

const authResult = await msalInstance.loginPopup(loginRequest);

console.log(authResult)

// Create a Graph client instance
