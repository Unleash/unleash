import React, { FC } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useThemeMode } from 'hooks/useThemeMode';

const nonce =
    document.querySelector('meta[name=cspNonce]')?.getAttribute('content') ||
    undefined;

export const muiCache = createCache({
    key: 'mui',
    prepend: true,
    nonce,
});

export const ThemeProvider: FC = ({ children }) => {
    const { resolveTheme } = useThemeMode();

    return (
        <CacheProvider value={muiCache}>
            <MuiThemeProvider theme={resolveTheme()}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </CacheProvider>
    );
};
