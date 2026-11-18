import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

export type FocusTarget = {
    // makes the field reachable before it is focused, e.g. expands the
    // section that hides it or selects the pill that renders it
    reveal?: () => void;
    focus: () => void;
};

export const parameterFocusKey = (parameterName: string) =>
    `parameter:${parameterName}`;

export const variantsFocusKey = 'variants';

// a collapsible part of the form that hides the fields it covers
type FocusSection = {
    covers: (key: string) => boolean;
    reveal: () => void;
};

export type FocusRegistry = {
    targets: Map<string, FocusTarget>;
    sections: Set<FocusSection>;
};

const FormFocusContext = createContext<FocusRegistry | undefined>(undefined);

type PendingFocus = { key: string };

// the form holds the registry and decides who gets focus; fields register
// how they are revealed and focused, sections which fields they hide
export const useFormFocus = () => {
    const registry = useRef<FocusRegistry>({
        targets: new Map(),
        sections: new Set(),
    });
    const [pendingFocus, setPendingFocus] = useState<PendingFocus>();

    const focusFirst = (keys: string[]) => {
        const { targets, sections } = registry.current;
        const key = keys.find((key) => targets.has(key));
        if (!key) return;
        for (const section of sections) {
            if (section.covers(key)) {
                section.reveal();
            }
        }
        targets.get(key)?.reveal?.();
        setPendingFocus({ key });
    };

    // focusing waits for the render that shows the revealed field; a hidden
    // field cannot take focus
    useEffect(() => {
        if (!pendingFocus) return;
        registry.current.targets.get(pendingFocus.key)?.focus();
    }, [pendingFocus]);

    return { focusRegistry: registry.current, focusFirst };
};

export const FormFocusProvider = ({
    registry,
    children,
}: {
    registry: FocusRegistry;
    children: ReactNode;
}) => (
    <FormFocusContext.Provider value={registry}>
        {children}
    </FormFocusContext.Provider>
);

export const useFocusSection = (keys: string[], reveal: () => void) => {
    const registry = useContext(FormFocusContext);
    const latest = useRef({ keys, reveal });
    latest.current = { keys, reveal };

    useEffect(() => {
        if (!registry) return;
        const section: FocusSection = {
            covers: (key) => latest.current.keys.includes(key),
            reveal: () => latest.current.reveal(),
        };
        registry.sections.add(section);
        return () => {
            registry.sections.delete(section);
        };
    }, [registry]);
};

export const useFocusTarget = (key: string, target: FocusTarget) => {
    const registry = useContext(FormFocusContext);
    const latestTarget = useRef(target);
    latestTarget.current = target;

    useEffect(() => {
        if (!registry) return;
        registry.targets.set(key, {
            reveal: () => latestTarget.current.reveal?.(),
            focus: () => latestTarget.current.focus(),
        });
        return () => {
            registry.targets.delete(key);
        };
    }, [key, registry]);
};
