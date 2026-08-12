import { useActiveSurvey } from './survey/useActiveSurvey.ts';
import { UxSurveyCard } from './survey/UxSurveyCard.tsx';

const UxTweakRunner = () => {
    const survey = useActiveSurvey();

    if (!survey) {
        return null;
    }

    return <UxSurveyCard key={survey.surveyId} survey={survey} />;
};

export default UxTweakRunner;
