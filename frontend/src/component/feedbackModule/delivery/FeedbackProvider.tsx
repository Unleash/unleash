import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';
import {
    type IToggle,
    useFlags,
    useUnleashClient,
} from '@unleash/proxy-client-react';
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

interface FeedbackContextValue {
    survey: Survey | null;
    submit: (answers: SurveyAnswers) => void;
    dismiss: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const findEligibleSurvey = (flags: IToggle[]): Survey | null => {
    for (const flag of flags.toSorted((a, b) => a.name.localeCompare(b.name))) {
        const survey = parseSurveyPayload(flag.name, flag.variant?.payload);
        if (survey && shouldShowSurvey(survey.flagName)) {
            return survey;
        }
    }
    return null;
};

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
    const flags = useFlags();
    const client = useUnleashClient();
    const [shownSurvey, setShownSurvey] = useState<Survey | null>(null);

    const survey = shownSurvey ?? findEligibleSurvey(flags);
    if (survey !== shownSurvey) {
        setShownSurvey(survey);
    }

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
        const { sessionId } = client.getContext();
        submitSurveyResponse({
            flagName: survey.flagName,
            respondentId: sessionId ? String(sessionId) : undefined,
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
