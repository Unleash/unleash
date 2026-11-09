import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useEffectEvent,
    useMemo,
    useState,
} from 'react';
import {
    type IToggle,
    useFlags,
    useUnleashClient,
} from '@unleash/proxy-client-react';
import type { IContext } from 'unleash-proxy-client';
import {
    parseSurveyPayload,
    type Survey,
    type SurveyAnswers,
} from '../survey.ts';
import {
    recordSurveyImpression,
    recordSurveyInteraction,
    shouldShowSurvey,
} from './surveyStorage.ts';
import { submitSurveyResponse } from './submitSurveyResponse.ts';
import {
    matchesPage,
    matchTriggers,
    type TriggerEvent,
} from '../triggers/matchTriggers.ts';
import {
    observeBrowserPage,
    type PageObserver,
} from '../observers/observePage.ts';
import {
    observeBrowserClicks,
    type ClickObserver,
} from '../observers/observeClicks.ts';
import {
    type AppearObserver,
    observeBrowserAppear,
} from '../observers/observeAppear.ts';
import { basePath as appBasePath } from 'utils/formatPath';
import { unique } from 'utils/unique';
import { useCustomEvent } from 'hooks/useCustomEvent';

interface FeedbackContextValue {
    survey: Survey | null;
    submit: (answers: SurveyAnswers) => void;
    dismiss: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const parseSurveys = (flags: IToggle[]): Survey[] =>
    flags
        .toSorted((a, b) => a.name.localeCompare(b.name))
        .map((flag) => parseSurveyPayload(flag.name, flag.variant?.payload))
        .filter((survey) => survey !== null);

const findEligibleSurvey = (
    surveys: Survey[],
    event: TriggerEvent,
): Survey | null =>
    matchTriggers(event, surveys).find(({ flagName }) =>
        shouldShowSurvey(flagName),
    ) ?? null;

const customEventNames = (surveys: Survey[]): string[] =>
    unique(
        surveys.flatMap(({ trigger }) =>
            trigger.on === 'event' ? [trigger.name] : [],
        ),
    ).toSorted();

interface SurveyEventListenerProps {
    name: string;
    onEvent: (name: string) => void;
}

const SurveyEventListener = ({ name, onEvent }: SurveyEventListenerProps) => {
    useCustomEvent(name, () => onEvent(name));
    return null;
};

export type IdentifyUser = (context: IContext) => string | undefined;

interface FeedbackProviderProps {
    children: ReactNode;
    identifyUser: IdentifyUser;
    observePage?: PageObserver;
    observeClicks?: ClickObserver;
    observeAppear?: AppearObserver;
    basePath?: string;
}

export const FeedbackProvider = ({
    children,
    identifyUser,
    observePage = observeBrowserPage,
    observeClicks = observeBrowserClicks,
    observeAppear = observeBrowserAppear,
    basePath = appBasePath,
}: FeedbackProviderProps) => {
    const flags = useFlags();
    const surveys = useMemo(() => parseSurveys(flags), [flags]);
    const client = useUnleashClient();
    const [path, setPath] = useState<string | null>(null);
    const [shownSurvey, setShownSurvey] = useState<Survey | null>(null);

    useEffect(() => observePage(setPath, basePath), [observePage, basePath]);

    const survey =
        shownSurvey ??
        (path === null
            ? null
            : findEligibleSurvey(surveys, { on: 'page', path }));
    if (survey !== shownSurvey) {
        setShownSurvey(survey);
    }

    const showSurveyOn = (event: TriggerEvent) => {
        if (survey !== null) {
            return;
        }
        const triggeredSurvey = findEligibleSurvey(surveys, event);
        if (triggeredSurvey !== null) {
            setShownSurvey((shown) => shown ?? triggeredSurvey);
        }
    };

    const showSurveyOnClick = useEffectEvent((target: Element) => {
        if (path !== null) {
            showSurveyOn({ on: 'click', path, target });
        }
    });

    useEffect(() => observeClicks(showSurveyOnClick), [observeClicks]);

    const showSurveyOnAppear = useEffectEvent((added: Element) => {
        if (path !== null) {
            showSurveyOn({ on: 'appear', path, added });
        }
    });

    const waitsForAppearance =
        survey === null &&
        path !== null &&
        surveys.some(
            ({ trigger }) =>
                trigger.on === 'appear' && matchesPage(trigger, path),
        );
    useEffect(() => {
        if (waitsForAppearance) {
            return observeAppear(showSurveyOnAppear);
        }
    }, [observeAppear, waitsForAppearance]);

    const showSurveyOnEvent = (name: string) => {
        if (path !== null) {
            showSurveyOn({ on: 'event', path, name });
        }
    };

    const eventNames = useMemo(() => customEventNames(surveys), [surveys]);

    const flagName = survey?.flagName;
    useEffect(() => {
        if (flagName) {
            recordSurveyImpression(flagName);
        }
    }, [flagName]);

    const submit = (answers: SurveyAnswers) => {
        if (!survey) {
            return;
        }
        recordSurveyInteraction(survey.flagName);
        submitSurveyResponse({
            flagName: survey.flagName,
            submitBase: survey.submitBase,
            environmentId: survey.environmentId,
            respondentId: identifyUser(client.getContext()),
            answers,
        }).catch(() => {});
    };

    const dismiss = () => {
        if (survey) {
            recordSurveyInteraction(survey.flagName);
        }
        setShownSurvey(null);
    };

    return (
        <FeedbackContext.Provider value={{ survey, submit, dismiss }}>
            {eventNames.map((name) => (
                <SurveyEventListener
                    key={name}
                    name={name}
                    onEvent={showSurveyOnEvent}
                />
            ))}
            {children}
        </FeedbackContext.Provider>
    );
};

export const useSurvey = (): FeedbackContextValue => {
    const context = useContext(FeedbackContext);
    if (!context) {
        throw new Error('useSurvey must be used inside FeedbackProvider');
    }
    return context;
};
