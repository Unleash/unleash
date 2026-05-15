import {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type FC,
    type ReactElement,
} from 'react';
import { useFeatureEnvironmentEvents } from 'hooks/api/getters/useFeatureEnvironmentEvents/useFeatureEnvironmentEvents';
import type { MultimetricFeatureEvent } from 'component/impact-metrics/MultimetricChart/types';

// Rules of hooks forbid calling a hook in a loop with a variable length, so
// each followed feature gets its own child component that fetches its events
// and reports them up via callback. This keeps the hook count stable per
// child even as the parent's feature list changes.

type SingleFeatureEventLoaderProps = {
    featureName: string;
    project: string;
    environment: string;
    onLoaded: (
        featureName: string,
        events: MultimetricFeatureEvent[],
        loading: boolean,
    ) => void;
};

const SingleFeatureEventLoader: FC<SingleFeatureEventLoaderProps> = memo(
    ({ featureName, project, environment, onLoaded }) => {
        const { featureEvents, loading } = useFeatureEnvironmentEvents({
            featureName,
            project,
            environment,
        });

        useEffect(() => {
            onLoaded(featureName, featureEvents, loading);
        }, [featureName, featureEvents, loading, onLoaded]);

        return null;
    },
);

SingleFeatureEventLoader.displayName = 'SingleFeatureEventLoader';

export type UseMergedFeatureEvents = {
    featureEvents: MultimetricFeatureEvent[];
    loading: boolean;
    loaders: ReactElement | null;
};

export const useMergedFeatureEvents = (
    featureNames: string[],
    project: string,
    environment: string,
): UseMergedFeatureEvents => {
    const [byFeature, setByFeature] = useState<
        Record<string, { events: MultimetricFeatureEvent[]; loading: boolean }>
    >({});
    const followedSetRef = useRef<Set<string>>(new Set());

    const followedSet = useMemo(() => new Set(featureNames), [featureNames]);

    useEffect(() => {
        followedSetRef.current = followedSet;
        setByFeature((current) => {
            const next: typeof current = {};
            for (const name of followedSet) {
                if (current[name]) next[name] = current[name];
            }
            return next;
        });
    }, [followedSet]);

    const handleLoaded = useCallback(
        (
            featureName: string,
            events: MultimetricFeatureEvent[],
            loading: boolean,
        ) => {
            setByFeature((current) => {
                if (!followedSetRef.current.has(featureName)) return current;
                const existing = current[featureName];
                if (
                    existing &&
                    existing.loading === loading &&
                    existing.events === events
                ) {
                    return current;
                }
                return { ...current, [featureName]: { events, loading } };
            });
        },
        [],
    );

    const loaders =
        featureNames.length > 0 ? (
            <>
                {featureNames.map((name) => (
                    <SingleFeatureEventLoader
                        key={name}
                        featureName={name}
                        project={project}
                        environment={environment}
                        onLoaded={handleLoaded}
                    />
                ))}
            </>
        ) : null;

    const { featureEvents, loading } = useMemo(() => {
        const merged: MultimetricFeatureEvent[] = [];
        const seen = new Set<number>();
        let isLoading = false;
        for (const name of featureNames) {
            const entry = byFeature[name];
            if (!entry) {
                isLoading = true;
                continue;
            }
            if (entry.loading) isLoading = true;
            for (const event of entry.events) {
                if (seen.has(event.id)) continue;
                seen.add(event.id);
                merged.push(event);
            }
        }
        merged.sort((left, right) => left.timestamp - right.timestamp);
        return { featureEvents: merged, loading: isLoading };
    }, [byFeature, featureNames]);

    return { featureEvents, loading, loaders };
};
