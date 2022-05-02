import React, { FC } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import mainTheme from 'themes/theme';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

export const muiCache = createCache({
    key: 'mui',
    prepend: true,
});

export const ThemeProvider: FC = ({ children }) => (
    <CacheProvider value={muiCache}>
        <MuiThemeProvider theme={mainTheme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    </CacheProvider>
);
