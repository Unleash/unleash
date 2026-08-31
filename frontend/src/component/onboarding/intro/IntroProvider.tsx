import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useRef,
    useState,
} from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi.ts';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash.ts';
import { IntroDialog } from './IntroDialog.tsx';

export const ONBOARDING_INTRO_FINISHED_SPLASH_ID = 'onboarding-intro-finished';

interface OpenOptions {
    /** Runs when the intro is dismissed (close, backdrop, Escape, Skip, or Finish). */
    onClose?: () => void;
    /** Runs after the dialog's leave transition — layout has settled. */
    onExited?: () => void;
    /** Runs only when the user completes the intro (Finish button). */
    onFinish?: () => void;
}

interface IntroContextValue {
    open: (options?: OpenOptions) => void;
}

const IntroContext = createContext<IntroContextValue | null>(null);

/**
 * Renders {@link IntroDialog} once at App level and exposes an `open()`
 * function via context so any component (help menu, signup completion, etc.)
 * can trigger the same intro instance. Only one dialog lifecycle to reason
 * about; new call sites don't have to plumb state through the tree.
 */
export const IntroProvider = ({ children }: { children: ReactNode }) => {
    const enabled = useUiFlag('onboardingIntroTour');
    const { setSplashSeen } = useSplashApi();
    const { refetchSplash } = useAuthSplash();
    const [isOpen, setIsOpen] = useState(false);
    // Held in refs so re-renders don't clear pending callbacks between the
    // open() call and the eventual close/finish.
    const onCloseRef = useRef<(() => void) | undefined>(undefined);
    const onExitedRef = useRef<(() => void) | undefined>(undefined);
    const onFinishRef = useRef<(() => void) | undefined>(undefined);

    const open = useCallback(
        (options?: OpenOptions) => {
            if (!enabled) return;
            onCloseRef.current = options?.onClose;
            onExitedRef.current = options?.onExited;
            onFinishRef.current = options?.onFinish;
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

    const handleExited = useCallback(() => {
        const onExited = onExitedRef.current;
        onExitedRef.current = undefined;
        onFinishRef.current = undefined;
        onExited?.();
    }, []);

    const handleFinish = useCallback(() => {
        setSplashSeen(ONBOARDING_INTRO_FINISHED_SPLASH_ID).then(refetchSplash);
        onFinishRef.current?.();
    }, [setSplashSeen, refetchSplash]);

    return (
        <IntroContext.Provider value={{ open }}>
            {children}
            {enabled && (
                <IntroDialog
                    open={isOpen}
                    onClose={handleClose}
                    onExited={handleExited}
                    onFinish={handleFinish}
                />
            )}
        </IntroContext.Provider>
    );
};

const NOOP_VALUE: IntroContextValue = { open: () => {} };

/**
 * Access the shared intro controls. When no {@link IntroProvider} is
 * mounted (e.g. isolated tests or stories), returns a disabled no-op so
 * consumers can render safely without wrapping every test.
 */
export const useIntro = (): IntroContextValue =>
    useContext(IntroContext) ?? NOOP_VALUE;
