import { useLatched } from './useLatched.ts';
import { useActiveSurvey } from './survey/useActiveSurvey.ts';
import { UxSurveyCard } from './survey/UxSurveyCard.tsx';

const UxTweakRunner = () => {
    const activeSurvey = useActiveSurvey();
    // Latched: once shown, the card survives flag refreshes and route changes.
    const survey = useLatched(activeSurvey);

    if (!survey) {
        return null;
    }

    return <UxSurveyCard key={survey.surveyId} survey={survey} />;
};

export default UxTweakRunner;
