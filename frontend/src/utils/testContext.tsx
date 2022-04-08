import { SWRConfig } from 'swr';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@material-ui/core/styles';
import theme from 'themes/mainTheme';
import React from 'react';

export const TestContext: React.FC = ({ children }) => {
    return (
        <SWRConfig value={{ provider: () => new Map() }}>
            <MemoryRouter>
                <ThemeProvider theme={theme}>{children}</ThemeProvider>
            </MemoryRouter>
        </SWRConfig>
    );
};
