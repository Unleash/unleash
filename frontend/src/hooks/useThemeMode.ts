import UIContext, { type themeMode } from 'contexts/UIContext';
import { useContext } from 'react';
import { setLocalStorageItem } from 'utils/storage';
import { lightTheme } from 'themes/theme';
import { darkTheme } from 'themes/dark-theme';
import legacyLightTheme from 'themes/theme.legacy';
import legacyDarkTheme from 'themes/dark-theme.legacy';
import type { Theme } from '@mui/material/styles/createTheme';
import { useUiFlag } from './useUiFlag';

interface IUseThemeModeOutput {
    resolveTheme: () => Theme;
    onSetThemeMode: () => void;
    themeMode: themeMode;
}

export const useThemeMode = (): IUseThemeModeOutput => {
    const { themeMode, setThemeMode } = useContext(UIContext);
    const key = 'unleash-theme';
    const uiGlobalFontSizeEnabled = useUiFlag('uiGlobalFontSize');

    let useNewTheme = false;
    if (typeof uiGlobalFontSizeEnabled === 'boolean') {
        useNewTheme = uiGlobalFontSizeEnabled;
    } else if (typeof uiGlobalFontSizeEnabled === 'object') {
        useNewTheme =
            'name' in uiGlobalFontSizeEnabled &&
            uiGlobalFontSizeEnabled.name !== 'disabled';
    }

    const resolveTheme = () => {
        if (themeMode === 'light') {
            return useNewTheme ? lightTheme : legacyLightTheme;
        }

        return useNewTheme ? darkTheme : legacyDarkTheme;
    };

    const onSetThemeMode = () => {
        setThemeMode((prev: themeMode) => {
            if (prev === 'light') {
                setLocalStorageItem(key, 'dark');
                return 'dark';
            }
            setLocalStorageItem(key, 'light');
            return 'light';
        });
    };

    return { resolveTheme, onSetThemeMode, themeMode };
};
