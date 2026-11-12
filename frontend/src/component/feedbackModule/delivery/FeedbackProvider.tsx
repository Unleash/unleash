import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useEffectEvent,
    useMemo,
} from 'react';
import type { Survey, SurveyAnswers } from '../survey.ts';
import * as surveyStorage from './surveyStorage.ts';
import type { IdentifyUser } from './identifyUser.ts';
import { useSurveys } from './useSurveys.ts';
import { useSurveyActions } from './useSurveyActions.ts';
import { useSurveyScheduler } from './useSurveyScheduler.ts';
import type { TriggerEvent } from '../triggers/triggerEvent.ts';
import {
    observeBrowserTriggers,
    type TriggerObserver,
} from '../observers/observeTriggers.ts';

interface FeedbackContextValue {
    survey: Survey | null;
    submit: (answers: SurveyAnswers) => void;
    dismiss: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

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
    const {
        shown,
        process,
        dismiss: closeSurvey,
    } = useSurveyScheduler(surveys, surveyStorage);

    const triggers = useMemo(
        () => surveys.map((survey) => survey.trigger),
        [surveys],
    );

    const onTrigger = useEffectEvent((event: TriggerEvent) => process(event));

    useEffect(
        () => observeTriggers(triggers, onTrigger),
        [observeTriggers, triggers],
    );

    const shownFlagName = shown?.flagName;
    useEffect(() => {
        if (shownFlagName) {
            surveyStorage.recordSurveyImpression(shownFlagName);
        }
    }, [shownFlagName]);

    const { submit, dismiss } = useSurveyActions({
        shownSurvey: shown,
        identifyUser,
        closeSurvey,
    });

    return (
        <FeedbackContext.Provider value={{ survey: shown, submit, dismiss }}>
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
