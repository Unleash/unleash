import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useRef,
    useState,
} from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { QuickTourDialog } from './QuickTourDialog.tsx';

interface OpenOptions {
    /** Runs after the tour closes (via ✕, backdrop, Escape, Skip, or Finish). */
    onClose?: () => void;
}

interface QuickTourContextValue {
    open: (options?: OpenOptions) => void;
}

const QuickTourContext = createContext<QuickTourContextValue | null>(null);

/**
 * Renders {@link QuickTourDialog} once at App level and exposes an `open()`
 * function via context so any component (help menu, signup completion, …)
 * can trigger the same tour instance. Only one dialog lifecycle to reason
 * about; new call sites don't have to plumb state through the tree.
 */
export const QuickTourProvider = ({ children }: { children: ReactNode }) => {
    const enabled = useUiFlag('quickTourDemo');
    const [isOpen, setIsOpen] = useState(false);
    // Held in a ref so re-renders don't clear a pending onClose between the
    // open() call and the eventual close.
    const onCloseRef = useRef<(() => void) | undefined>(undefined);

    const open = useCallback(
        (options?: OpenOptions) => {
            if (!enabled) return;
            onCloseRef.current = options?.onClose;
            setIsOpen(true);
        },
        [enabled],
    );

    const handleClose = useCallback(() => {
        setIsOpen(false);
        const onClose = onCloseRef.current;
        onCloseRef.current = undefined;
        onClose?.();
    }, []);

    return (
        <QuickTourContext.Provider value={{ open }}>
            {children}
            {enabled && <QuickTourDialog open={isOpen} onClose={handleClose} />}
        </QuickTourContext.Provider>
    );
};

const NOOP_VALUE: QuickTourContextValue = { open: () => {} };

/**
 * Access the shared quick-tour controls. When no {@link QuickTourProvider} is
 * mounted (e.g. isolated tests or stories), returns a disabled no-op so
 * consumers can render safely without wrapping every test.
 */
export const useQuickTour = (): QuickTourContextValue =>
    useContext(QuickTourContext) ?? NOOP_VALUE;
