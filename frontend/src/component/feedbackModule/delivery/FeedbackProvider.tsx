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
import { matchTriggers } from '../triggers/matchTriggers.ts';
import {
    observeBrowserPage,
    type PageObserver,
} from '../observers/observePage.ts';
import { basePath as appBasePath } from 'utils/formatPath';

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

const findEligibleSurvey = (flags: IToggle[], path: string): Survey | null =>
    matchTriggers({ on: 'page', path }, parseSurveys(flags)).find(
        ({ flagName }) => shouldShowSurvey(flagName),
    ) ?? null;

interface FeedbackProviderProps {
    children: ReactNode;
    observePage?: PageObserver;
    basePath?: string;
}

export const FeedbackProvider = ({
    children,
    observePage = observeBrowserPage,
    basePath = appBasePath,
}: FeedbackProviderProps) => {
    const flags = useFlags();
    const client = useUnleashClient();
    const [path, setPath] = useState<string | null>(null);
    const [shownSurvey, setShownSurvey] = useState<Survey | null>(null);

    useEffect(() => observePage(setPath, basePath), [observePage, basePath]);

    const survey =
        shownSurvey ?? (path === null ? null : findEligibleSurvey(flags, path));
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
            submitBase: survey.submitBase,
            environmentId: survey.environmentId,
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
