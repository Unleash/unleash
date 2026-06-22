import type { ReactNode } from 'react';
import { useState } from 'react';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { getLocalStorageItem } from 'utils/storage';
import UIContext, {
    createEmptyToast,
    type themeMode,
} from 'contexts/UIContext';
import { lightTheme } from 'themes/theme';
import { darkTheme } from 'themes/dark-theme';
import { useThemeMode } from './useThemeMode';

// jsdom doesn't implement matchMedia (which MUI's useMediaQuery relies on),
// so provide a settable stand-in to drive the OS preference
const setOsPrefersDark = (prefersDark: boolean) => {
    window.matchMedia = ((query: string) => ({
        matches: prefersDark,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    })) as typeof window.matchMedia;
};

const renderUseThemeMode = (initialMode: themeMode) =>
    renderHook(() => useThemeMode(), {
        wrapper: ({ children }: { children: ReactNode }) => {
            const [themeMode, setThemeMode] = useState<themeMode>(initialMode);
            return (
                <UIContext.Provider
                    value={{
                        toastData: createEmptyToast(),
                        setToast: () => {},
                        showFeedback: false,
                        setShowFeedback: () => {},
                        themeMode,
                        setThemeMode,
                    }}
                >
                    {children}
                </UIContext.Provider>
            );
        },
    });

beforeEach(() => {
    localStorage.clear();
    setOsPrefersDark(false);
});

describe('resolveTheme', () => {
    it('returns the light theme for the light mode', () => {
        expect(renderUseThemeMode('light').result.current.resolveTheme()).toBe(
            lightTheme,
        );
    });

    it('returns the dark theme for the dark mode', () => {
        expect(renderUseThemeMode('dark').result.current.resolveTheme()).toBe(
            darkTheme,
        );
    });

    it('follows a light OS preference when set to system', () => {
        setOsPrefersDark(false);

        expect(renderUseThemeMode('system').result.current.resolveTheme()).toBe(
            lightTheme,
        );
    });

    it('follows a dark OS preference when set to system', () => {
        setOsPrefersDark(true);

        expect(renderUseThemeMode('system').result.current.resolveTheme()).toBe(
            darkTheme,
        );
    });
});

describe('setThemeMode', () => {
    it('updates the mode and persists it', () => {
        const { result } = renderUseThemeMode('light');

        act(() => result.current.setThemeMode('system'));

        expect(result.current.themeMode).toBe('system');
        expect(getLocalStorageItem('unleash-theme')).toBe('system');
    });
});

describe('onSetThemeMode', () => {
    it('toggles light to dark and persists', () => {
        const { result } = renderUseThemeMode('light');

        act(() => result.current.onSetThemeMode());

        expect(result.current.themeMode).toBe('dark');
        expect(getLocalStorageItem('unleash-theme')).toBe('dark');
    });

    it('toggles dark to light and persists', () => {
        const { result } = renderUseThemeMode('dark');

        act(() => result.current.onSetThemeMode());

        expect(result.current.themeMode).toBe('light');
        expect(getLocalStorageItem('unleash-theme')).toBe('light');
    });

    it('toggles system on a light OS to dark', () => {
        setOsPrefersDark(false);
        const { result } = renderUseThemeMode('system');

        act(() => result.current.onSetThemeMode());

        expect(result.current.themeMode).toBe('dark');
    });

    it('toggles system on a dark OS to light', () => {
        setOsPrefersDark(true);
        const { result } = renderUseThemeMode('system');

        act(() => result.current.onSetThemeMode());

        expect(result.current.themeMode).toBe('light');
    });
});
