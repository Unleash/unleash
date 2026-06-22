import UIContext, { type themeMode } from 'contexts/UIContext';
import { useContext } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { setLocalStorageItem } from 'utils/storage';
import { lightTheme } from 'themes/theme';
import { darkTheme } from 'themes/dark-theme';
import type { Theme } from '@mui/material/styles';

interface IUseThemeModeOutput {
    resolveTheme: () => Theme;
    onSetThemeMode: () => void;
    setThemeMode: (mode: themeMode) => void;
    themeMode: themeMode;
}

export const useThemeMode = (): IUseThemeModeOutput => {
    const { themeMode, setThemeMode: setContextThemeMode } =
        useContext(UIContext);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const key = 'unleash-theme';

    const resolvedMode: 'light' | 'dark' =
        themeMode === 'system'
            ? prefersDarkMode
                ? 'dark'
                : 'light'
            : themeMode;

    const resolveTheme = (): Theme =>
        resolvedMode === 'dark' ? darkTheme : lightTheme;

    const setThemeMode = (mode: themeMode) => {
        setLocalStorageItem(key, mode);
        setContextThemeMode(mode);
    };

    // toggle relative to what's currently shown, so it also works from 'system'
    const onSetThemeMode = () => {
        const next = resolvedMode === 'dark' ? 'light' : 'dark';
        setLocalStorageItem(key, next);
        setContextThemeMode(next);
    };

    return { resolveTheme, onSetThemeMode, setThemeMode, themeMode };
};
