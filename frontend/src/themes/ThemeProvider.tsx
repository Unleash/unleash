import React, { FC } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useThemeMode } from 'hooks/useThemeMode';

export const muiCache = createCache({
    key: 'mui',
    prepend: true,
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
