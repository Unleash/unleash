import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useEffectEvent,
    useMemo,
    useState,
} from 'react';
import type { Survey, SurveyAnswers } from '../survey.ts';
import { recordSurveyImpression, shouldShowSurvey } from './surveyStorage.ts';
import type { IdentifyUser } from './identifyUser.ts';
import { useSurveys } from './useSurveys.ts';
import { useSurveyActions } from './useSurveyActions.ts';
import { matchTriggers } from '../triggers/matchTriggers.ts';
import type { TriggerEvent } from '../triggers/triggerEvent.ts';
import {
    observeBrowserTriggers,
    type TriggerObserver,
} from '../observers/observeTriggers.ts';
import { unique } from 'utils/unique';
import { useCustomEvent } from 'hooks/useCustomEvent';

interface FeedbackContextValue {
    survey: Survey | null;
    submit: (answers: SurveyAnswers) => void;
    dismiss: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

interface TriggeredSurvey {
    survey: Survey;
    triggerOccurredAt: number;
}

const findEligibleSurvey = (
    surveys: Survey[],
    event: TriggerEvent,
): Survey | null =>
    matchTriggers(event, surveys).find(({ flagName }) =>
        shouldShowSurvey(flagName),
    ) ?? null;

const triggerSurvey = (survey: Survey): TriggeredSurvey => ({
    survey,
    triggerOccurredAt: Date.now(),
});

const triggerPageSurvey = (
    surveys: Survey[],
    path: string | null,
): TriggeredSurvey | null => {
    if (path === null) {
        return null;
    }
    const pageSurvey = findEligibleSurvey(surveys, { on: 'page', path });
    return pageSurvey === null ? null : triggerSurvey(pageSurvey);
};

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

interface FeedbackProviderProps {
    children: ReactNode;
    identifyUser: IdentifyUser;
    observeTriggers?: TriggerObserver;
}

export const FeedbackProvider = ({
    children,
    identifyUser,
    observeTriggers = observeBrowserTriggers,
}: FeedbackProviderProps) => {
    const surveys = useSurveys();
    const [path, setPath] = useState<string | null>(null);
    const [storedTriggered, setTriggered] = useState<TriggeredSurvey | null>(
        null,
    );
    const [shownSurvey, setShownSurvey] = useState<Survey | null>(null);

    const triggered = storedTriggered ?? triggerPageSurvey(surveys, path);
    if (triggered !== storedTriggered) {
        setTriggered(triggered);
    }

    useEffect(() => {
        if (triggered === null) {
            return;
        }
        const { survey, triggerOccurredAt } = triggered;
        const timer = setTimeout(
            () => setShownSurvey(survey),
            triggerOccurredAt + (survey.trigger.delayMs ?? 0) - Date.now(),
        );
        return () => clearTimeout(timer);
    }, [triggered]);

    const showSurveyOn = (event: TriggerEvent) => {
        if (shownSurvey !== null) {
            return;
        }
        const triggeredSurvey = findEligibleSurvey(surveys, event);
        if (triggeredSurvey !== null) {
            setTriggered(triggerSurvey(triggeredSurvey));
        }
    };

    const onTrigger = useEffectEvent((event: TriggerEvent) => {
        if (event.on === 'page') {
            setPath(event.path);
        } else {
            showSurveyOn(event);
        }
    });

    const triggers = useMemo(
        () =>
            shownSurvey === null ? surveys.map(({ trigger }) => trigger) : [],
        [surveys, shownSurvey],
    );

    useEffect(
        () => observeTriggers(triggers, onTrigger),
        [observeTriggers, triggers],
    );

    const showSurveyOnEvent = (name: string) => {
        if (path !== null) {
            showSurveyOn({ on: 'event', path, name });
        }
    };

    const eventNames = useMemo(() => customEventNames(surveys), [surveys]);

    const closeSurvey = () => {
        setTriggered(null);
        setShownSurvey(null);
    };

    const shownFlagName = shownSurvey?.flagName;
    useEffect(() => {
        if (shownFlagName) {
            recordSurveyImpression(shownFlagName);
        }
    }, [shownFlagName]);

    const { submit, dismiss } = useSurveyActions({
        shownSurvey,
        identifyUser,
        closeSurvey,
    });

    return (
        <FeedbackContext.Provider
            value={{ survey: shownSurvey, submit, dismiss }}
        >
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
