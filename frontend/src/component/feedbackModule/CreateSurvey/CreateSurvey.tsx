import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, styled } from '@mui/material';
import GeneralSelect from 'component/common/GeneralSelect/GeneralSelect';
import Input from 'component/common/Input/Input';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import NotFound from 'component/common/NotFound/NotFound';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { CREATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import {
    type CreateSurveyResult,
    useSurveysApi,
} from 'hooks/api/actions/useSurveysApi/useSurveysApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GO_BACK } from 'constants/navigate';
import { parseSubmitBase, SURVEY_FLAG_PREFIX } from '../survey.ts';
import {
    hasSurveyErrors,
    initialSurveyDraft,
    type SurveyDraft,
    type SurveyErrors,
    toSurveyJson,
    validateSurveyDraft,
} from './surveyDraft.ts';
import { SurveyQuestions } from './SurveyQuestions/SurveyQuestions.tsx';

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

interface FormErrors {
    name?: string;
    submitUrl?: string;
    survey: SurveyErrors;
}

const NO_ERRORS: FormErrors = { survey: { questions: [] } };

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
    const { projects } = useProjects();
    const { uiConfig } = useUiConfig();
    const { createSurvey, loading } = useSurveysApi();

    const [projectId, setProjectId] = useState('default');
    const [name, setName] = useState(SURVEY_FLAG_PREFIX);
    const [editedSubmitUrl, setSubmitUrl] = useState<string>();
    const submitUrl = editedSubmitUrl ?? uiConfig.unleashUrl ?? '';
    const [draft, setDraft] = useState<SurveyDraft>(initialSurveyDraft);
    // Errors appear after the first submit and then follow the edits.
    const [showErrors, setShowErrors] = useState(false);
    const errors: FormErrors = {
        name: validateName(name),
        submitUrl: validateSubmitUrl(submitUrl),
        survey: validateSurveyDraft(draft),
    };
    const shownErrors = showErrors ? errors : NO_ERRORS;

    if (!feedbackModuleEnabled) {
        return <NotFound />;
    }

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setShowErrors(true);
        const submitBase = parseSubmitBase(submitUrl);
        if (
            errors.name ||
            submitBase === null ||
            hasSurveyErrors(errors.survey)
        ) {
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
            title='Create survey'
            description='A survey is an experiment flag whose variant payload holds the questions. Enable the flag in an environment to start showing it.'
        >
            <StyledForm onSubmit={onSubmit}>
                <GeneralSelect
                    label='Project'
                    value={projectId}
                    onChange={setProjectId}
                    options={projects.map((project) => ({
                        key: project.id,
                        label: project.name,
                    }))}
                    fullWidth
                />
                <Input
                    label='Flag name'
                    value={name}
                    onChange={(event) => setName(event.target.value.trim())}
                    error={Boolean(shownErrors.name)}
                    errorText={shownErrors.name}
                />
                <Input
                    label='Submit URL'
                    description='The Unleash instance that collects the responses. Defaults to this one.'
                    value={submitUrl}
                    onChange={(event) =>
                        setSubmitUrl(event.target.value.trim())
                    }
                    error={Boolean(shownErrors.submitUrl)}
                    errorText={shownErrors.submitUrl}
                    fullWidth
                />
                <Input
                    label='Title'
                    value={draft.title}
                    onChange={(event) =>
                        setDraft({ ...draft, title: event.target.value })
                    }
                    error={Boolean(shownErrors.survey.title)}
                    errorText={shownErrors.survey.title}
                    fullWidth
                />
                <Input
                    label='Description'
                    description='Optional. Shown under the title.'
                    value={draft.description}
                    onChange={(event) =>
                        setDraft({ ...draft, description: event.target.value })
                    }
                    multiline
                    minRows={2}
                    fullWidth
                />
                <SurveyQuestions
                    questions={draft.questions}
                    errors={shownErrors.survey.questions}
                    onChange={(questions) => setDraft({ ...draft, questions })}
                />
                <StyledButtons>
                    <Button onClick={() => navigate(GO_BACK)}>Cancel</Button>
                    <PermissionButton
                        type='submit'
                        permission={CREATE_FEATURE}
                        projectId={projectId}
                        disabled={loading}
                    >
                        Create survey
                    </PermissionButton>
                </StyledButtons>
            </StyledForm>
        </FormTemplate>
    );
};
