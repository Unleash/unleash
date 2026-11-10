import { useContext } from 'react';
import {
    type Location,
    UNSAFE_DataRouterContext,
    UNSAFE_NavigationContext,
    useLocation,
    useNavigate,
} from 'react-router';
import type {
    QueryParamAdapter,
    QueryParamAdapterComponent,
} from 'use-query-params';

/**
 * Query param adapter for `use-query-params` backed by React Router v7.
 *
 * This is a port of the library's bundled `ReactRouter6Adapter`. We can't use
 * that adapter directly: it reads React Router's context from its own pinned
 * `react-router-dom@6` copy, which is a different module instance (and a
 * different React context) than the v7 `react-router` our app provides, so it
 * would read an empty context and silently break query-param state. Importing
 * the internals from `react-router` keeps the adapter on the same router
 * instance as the rest of the app.
 *
 * The location fallback mirrors the v6 adapter, in priority order:
 *   1. `router.state.location` for data routers (createBrowserRouter etc.)
 *   2. `navigator.location` for component routers (e.g. <BrowserRouter>), which
 *      reflects a navigation synchronously, before React re-renders
 *   3. `useLocation()` as a last resort
 *
 * v7 dropped `location` from the `Navigator` type even though the underlying
 * history object still exposes it at runtime, so we read it behind an `in`
 * guard rather than asserting through `unknown`.
 */
export const ReactRouter7Adapter: QueryParamAdapterComponent = ({
    children,
}) => {
    const { navigator } = useContext(UNSAFE_NavigationContext);
    const navigate = useNavigate();
    const router = useContext(UNSAFE_DataRouterContext)?.router;
    const location = useLocation();

    const adapter: QueryParamAdapter = {
        replace(nextLocation) {
            navigate(nextLocation.search || '?', {
                replace: true,
                state: nextLocation.state,
            });
        },
        push(nextLocation) {
            navigate(nextLocation.search || '?', {
                replace: false,
                state: nextLocation.state,
            });
        },
        get location() {
            if (router?.state?.location) {
                return router.state.location;
            }
            if ('location' in navigator) {
                return (navigator as typeof navigator & { location: Location })
                    .location;
            }
            return location;
        },
    };

    return children(adapter);
};
