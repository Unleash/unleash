import { useContext, useEffect } from 'react';
import UIContext from 'contexts/UIContext';
import { SurveyCard } from '../SurveyCard/SurveyCard.tsx';
import { useSurvey } from './FeedbackProvider.tsx';

export const FeedbackSurvey = () => {
    const { survey, submit, dismiss } = useSurvey();
    const { setSurveyVisible } = useContext(UIContext);

    const isShown = survey !== null;
    useEffect(() => {
        if (!isShown) {
            return;
        }
        setSurveyVisible(true);
        return () => setSurveyVisible(false);
    }, [isShown, setSurveyVisible]);

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
