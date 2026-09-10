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

export type HelpButtonHintKind =
    | 'get-started'
    | 'intro-closed'
    | 'menu-regroup';

const HINT_KINDS: HelpButtonHintKind[] = [
    'get-started',
    'intro-closed',
    'menu-regroup',
];

interface HelpButtonHintContextValue {
    activeHint: HelpButtonHintKind | null;
    showHint: (kind: HelpButtonHintKind) => void;
    dismissHint: () => void;
    closeHint: () => void;
    isHintSeen: (kind: HelpButtonHintKind) => boolean;
    markHintSeen: (kind: HelpButtonHintKind) => void;
}

const storageKey = (kind: HelpButtonHintKind) =>
    `help-button-hint-seen:${kind}:v1`;

const NOOP_VALUE: HelpButtonHintContextValue = {
    activeHint: null,
    showHint: () => {},
    dismissHint: () => {},
    closeHint: () => {},
    isHintSeen: () => false,
    markHintSeen: () => {},
};

const HelpButtonHintContext =
    createContext<HelpButtonHintContextValue>(NOOP_VALUE);

export const HelpButtonHintProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [activeHint, setActiveHint] = useState<HelpButtonHintKind | null>(
        null,
    );

    const [seenHints, setSeenHints] = useState<ReadonlySet<HelpButtonHintKind>>(
        () =>
            new Set(
                HINT_KINDS.filter((kind) =>
                    getLocalStorageItem<boolean>(storageKey(kind)),
                ),
            ),
    );

    const isHintSeen = useCallback(
        (kind: HelpButtonHintKind) => seenHints.has(kind),
        [seenHints],
    );

    const markHintSeen = useCallback((kind: HelpButtonHintKind) => {
        setLocalStorageItem(storageKey(kind), true);
        setSeenHints((prev) => {
            if (prev.has(kind)) return prev;
            const next = new Set(prev);
            next.add(kind);
            return next;
        });
    }, []);

    const showHint = useCallback((kind: HelpButtonHintKind) => {
        if (getLocalStorageItem<boolean>(storageKey(kind))) return;
        setActiveHint(kind);
    }, []);

    const dismissHint = useCallback(() => {
        setActiveHint((current) => {
            if (current) markHintSeen(current);
            return null;
        });
    }, [markHintSeen]);

    const closeHint = useCallback(() => setActiveHint(null), []);

    useEffect(() => {
        if (!activeHint) return;
        window.addEventListener('resize', closeHint);
        return () => window.removeEventListener('resize', closeHint);
    }, [activeHint, closeHint]);

    const value = useMemo(
        () => ({
            activeHint,
            showHint,
            dismissHint,
            closeHint,
            isHintSeen,
            markHintSeen,
        }),
        [
            activeHint,
            showHint,
            dismissHint,
            closeHint,
            isHintSeen,
            markHintSeen,
        ],
    );

    return (
        <HelpButtonHintContext.Provider value={value}>
            {children}
        </HelpButtonHintContext.Provider>
    );
};

export const useHelpButtonHint = (): HelpButtonHintContextValue =>
    useContext(HelpButtonHintContext);
