import type { SurveyDraft, SurveyErrors } from './surveyDraft.ts';
import { SurveyQuestions } from './SurveyQuestions/SurveyQuestions.tsx';
import { SurveyTitleSlide } from './SurveyTitleSlide/SurveyTitleSlide.tsx';

interface DefineSurveyStepProps {
    draft: SurveyDraft;
    errors: SurveyErrors;
    onChange: (draft: SurveyDraft) => void;
}

export const DefineSurveyStep = ({
    draft,
    errors,
    onChange,
}: DefineSurveyStepProps) => (
    <>
        <SurveyTitleSlide
            titleSlide={draft}
            titleError={errors.title}
            onChange={(titleSlide) => onChange({ ...draft, ...titleSlide })}
        />
        <SurveyQuestions
            questions={draft.questions}
            errors={errors.questions}
            onChange={(questions) => onChange({ ...draft, questions })}
        />
    </>
);
