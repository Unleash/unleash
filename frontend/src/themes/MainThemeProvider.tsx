import React, { FC } from 'react';
import { CssBaseline, StylesProvider, ThemeProvider } from '@material-ui/core';
import mainTheme from './mainTheme';

export const MainThemeProvider: FC = ({ children }) => (
    <ThemeProvider theme={mainTheme}>
        <StylesProvider injectFirst>
            <CssBaseline />
            {children}
        </StylesProvider>
    </ThemeProvider>
);
