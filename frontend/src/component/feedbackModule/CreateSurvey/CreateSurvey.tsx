import { type FormEvent, type ReactNode, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router';
import { Button, styled } from '@mui/material';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import NotFound from 'component/common/NotFound/NotFound';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { Stepper } from 'component/common/Stepper/Stepper';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import {
    type CreateSurveyResult,
    useSurveysApi,
} from 'hooks/api/actions/useSurveysApi/useSurveysApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { parseSubmitBase, SURVEY_FLAG_PREFIX } from '../survey.ts';
import {
    hasSurveyErrors,
    initialSurveyDraft,
    type SurveyDraft,
    type SurveyErrors,
    toSurveyJson,
    validateSurveyDraft,
} from './surveyDraft.ts';
import { DefineSurveyStep } from './DefineSurveyStep.tsx';
import {
    type SurveySettingsErrors,
    SurveySettingsStep,
} from './SurveySettingsStep.tsx';

const StyledHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(2.5),
}));

const StyledTitle = styled('h1')(({ theme }) => ({
    ...theme.typography.h1,
    margin: 0,
}));

const StyledForm = styled('form')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const StyledButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
}));

interface WizardStep {
    label: string;
    hasErrors: boolean;
    content: ReactNode;
}

const NO_SURVEY_ERRORS: SurveyErrors = { questions: [] };

const validateName = (name: string): string | undefined =>
    !name.startsWith(SURVEY_FLAG_PREFIX) || name === SURVEY_FLAG_PREFIX
        ? `Must start with "${SURVEY_FLAG_PREFIX}" followed by a name`
        : undefined;

const validateSubmitUrl = (submitUrl: string): string | undefined =>
    parseSubmitBase(submitUrl) === null
        ? 'Enter a URL starting with http:// or https://'
        : undefined;

export const CreateSurvey = () => {
    const feedbackModuleEnabled = useUiFlag('feedbackModule');
    const navigate = useNavigate();
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const { createSurvey, loading } = useSurveysApi();

    const [projectId, setProjectId] = useState('default');
    const [name, setName] = useState(SURVEY_FLAG_PREFIX);
    const [editedSubmitUrl, setSubmitUrl] = useState<string>();
    const submitUrl = editedSubmitUrl ?? uiConfig.unleashUrl ?? '';
    const [draft, setDraft] = useState<SurveyDraft>(initialSurveyDraft);
    const [stepIndex, setStepIndex] = useState(0);
    // Errors appear after the first attempt to leave a step and then follow the edits.
    const [showErrors, setShowErrors] = useState(false);
    const surveyErrors = validateSurveyDraft(draft);
    const settingsErrors: SurveySettingsErrors = {
        name: validateName(name),
        submitUrl: validateSubmitUrl(submitUrl),
    };
    const formRef = useRef<HTMLFormElement>(null);

    if (!feedbackModuleEnabled) {
        return <NotFound />;
    }

    const steps: WizardStep[] = [
        {
            label: 'Define survey',
            hasErrors: hasSurveyErrors(surveyErrors),
            content: (
                <DefineSurveyStep
                    draft={draft}
                    errors={showErrors ? surveyErrors : NO_SURVEY_ERRORS}
                    onChange={setDraft}
                />
            ),
        },
        {
            label: 'Settings',
            hasErrors: Boolean(settingsErrors.name || settingsErrors.submitUrl),
            content: (
                <SurveySettingsStep
                    projectId={projectId}
                    name={name}
                    submitUrl={submitUrl}
                    errors={showErrors ? settingsErrors : {}}
                    onProjectIdChange={setProjectId}
                    onNameChange={setName}
                    onSubmitUrlChange={setSubmitUrl}
                />
            ),
        },
    ];
    const isLastStep = stepIndex === steps.length - 1;

    const goToStep = (index: number) => {
        setShowErrors(false);
        setStepIndex(index);
    };

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (steps[stepIndex].hasErrors) {
            // Flushed so the invalid fields are marked in the DOM before focusing.
            flushSync(() => setShowErrors(true));
            const firstInvalid = formRef.current?.querySelector<HTMLElement>(
                '[aria-invalid="true"]',
            );
            firstInvalid?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
            firstInvalid?.focus({ preventScroll: true });
            return;
        }
        if (!isLastStep) {
            goToStep(stepIndex + 1);
            return;
        }
        const submitBase = parseSubmitBase(submitUrl);
        if (submitBase === null) {
            return;
        }
        let result: CreateSurveyResult;
        try {
            result = await createSurvey(
                projectId,
                name,
                toSurveyJson(draft),
                submitBase,
            );
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
            return;
        }
        if (result.tag === 'failed' || result.strategies === 'failed') {
            setToastData({
                type: 'error',
                text: 'Survey created, but some steps failed. Make sure the strategy is set up and the role:survey tag is applied.',
                persist: true,
            });
        } else {
            setToastData({ type: 'success', text: 'Survey created' });
        }
        navigate(`/projects/${projectId}/features/${name}`);
    };

    return (
        <FormTemplate
            loading={loading}
            description='A survey is an experiment flag whose variant payload holds the questions. Enable the flag in an environment to start showing it.'
        >
            <StyledHeader>
                <Stepper
                    steps={steps.map((step, index) => ({
                        label: step.label,
                        clickable: index < stepIndex,
                    }))}
                    activeIndex={stepIndex}
                    onStepClick={goToStep}
                />
                <StyledTitle>Create survey</StyledTitle>
            </StyledHeader>
            <StyledForm ref={formRef} onSubmit={onSubmit}>
                {steps[stepIndex].content}
                <StyledButtons>
                    {stepIndex > 0 ? (
                        <Button
                            variant='outlined'
                            onClick={() => goToStep(stepIndex - 1)}
                        >
                            Back
                        </Button>
                    ) : null}
                    {isLastStep ? (
                        <PermissionButton
                            type='submit'
                            permission={CREATE_FEATURE}
                            projectId={projectId}
                            disabled={loading}
                        >
                            Create survey
                        </PermissionButton>
                    ) : (
                        <Button type='submit' variant='contained'>
                            Next
                        </Button>
                    )}
                </StyledButtons>
            </StyledForm>
        </FormTemplate>
    );
};
