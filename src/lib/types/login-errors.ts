// `?errorMsg=` codes the server puts so the login page can show.
// the `?errorMsg=<message>` redirects still work.
export const LOGIN_ERROR_CODES = {
    oidcNotEnabled: 'oidc_not_enabled',
} as const;
