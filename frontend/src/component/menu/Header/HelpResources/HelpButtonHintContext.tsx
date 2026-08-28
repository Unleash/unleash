import {
    createContext,
    type FC,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { getLocalStorageItem, setLocalStorageItem } from 'utils/storage.ts';

export type HelpButtonHintKind = 'get-started' | 'intro-closed';

interface HelpButtonHintContextValue {
    activeHint: HelpButtonHintKind | null;
    showHint: (kind: HelpButtonHintKind) => void;
    dismissHint: () => void;
}

const storageKey = (kind: HelpButtonHintKind) =>
    `help-button-hint-seen:${kind}:v1`;

const NOOP_VALUE: HelpButtonHintContextValue = {
    activeHint: null,
    showHint: () => {},
    dismissHint: () => {},
};

const HelpButtonHintContext =
    createContext<HelpButtonHintContextValue>(NOOP_VALUE);

export const HelpButtonHintProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [activeHint, setActiveHint] = useState<HelpButtonHintKind | null>(
        null,
    );

    const showHint = useCallback((kind: HelpButtonHintKind) => {
        if (getLocalStorageItem<boolean>(storageKey(kind))) return;
        setActiveHint(kind);
    }, []);

    const dismissHint = useCallback(() => {
        if (activeHint) setLocalStorageItem(storageKey(activeHint), true);
        setActiveHint(null);
    }, [activeHint]);

    useEffect(() => {
        if (!activeHint) return;
        window.addEventListener('resize', dismissHint);
        return () => window.removeEventListener('resize', dismissHint);
    }, [activeHint, dismissHint]);

    const value = useMemo(
        () => ({ activeHint, showHint, dismissHint }),
        [activeHint, showHint, dismissHint],
    );

    return (
        <HelpButtonHintContext.Provider value={value}>
            {children}
        </HelpButtonHintContext.Provider>
    );
};

export const useHelpButtonHint = (): HelpButtonHintContextValue =>
    useContext(HelpButtonHintContext);
