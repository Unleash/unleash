import { SurveyCard } from '../SurveyCard/SurveyCard.tsx';
import { useSurvey } from './FeedbackProvider.tsx';

export const FeedbackSurvey = () => {
    const { survey, submit, dismiss } = useSurvey();

    if (!survey) {
        return null;
    }

    return (
        <SurveyCard
            key={survey.flagName}
            survey={survey}
            onSubmit={submit}
            onDismiss={dismiss}
        />
    );
};
