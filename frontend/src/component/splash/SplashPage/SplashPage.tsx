import { Switch, Route, useHistory, Redirect } from 'react-router-dom';
import { SplashPageEnvironments } from '../SplashPageEnvironments/SplashPageEnvironments';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi';
import { SplashPageOperators } from 'component/splash/SplashPageOperators/SplashPageOperators';
import { useEffect } from 'react';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash';

// All known splash IDs.
export const splashIds = ['environments', 'operators'] as const;

// Active splash IDs that may be shown to the user.
export const activeSplashIds: SplashId[] = ['operators'];

export type SplashId = typeof splashIds[number];

export const SplashPage = () => {
    const splashId = useRequiredPathParam('splashId');
    const isKnownId = isKnownSplashId(splashId);
    const { refetchSplash } = useAuthSplash();
    const { setSplashSeen } = useSplashApi();

    // Close the splash "modal" on escape.
    useNavigationOnKeydown('Escape', '/');

    // Mark the splash ID as seen.
    useEffect(() => {
        if (splashId && isKnownId) {
            setSplashSeen(splashId)
                .then(() => refetchSplash())
                .catch(console.warn);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [splashId, isKnownId]);

    if (!isKnownId) {
        return null;
    }

    return (
        <Switch>
            <Route path="/splash/environments">
                <SplashPageEnvironments />
            </Route>
            <Route path="/splash/operators">
                <SplashPageOperators />
            </Route>
            <Route>
                <Redirect to="/" />
            </Route>
        </Switch>
    );
};

const useNavigationOnKeydown = (key: string, path: string) => {
    const { push } = useHistory();

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.code === key) {
                push(path);
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [key, path, push]);
};

const isKnownSplashId = (value: string): value is SplashId => {
    return (splashIds as Readonly<string[]>).includes(value);
};
