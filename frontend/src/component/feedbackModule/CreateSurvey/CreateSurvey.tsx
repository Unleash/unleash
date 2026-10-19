import { lazy, type FormEvent, Suspense, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, styled, Typography } from '@mui/material';
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
import {
    parseSubmitBase,
    parseSurveyDefinition,
    SURVEY_FLAG_PREFIX,
    SURVEY_TEMPLATE,
} from '../survey.ts';

const LazyReactJSONEditor = lazy(
    () => import('component/common/ReactJSONEditor/ReactJSONEditor'),
);

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

type Errors = { name?: string; submitUrl?: string; survey?: string };

type Validation =
    | { status: 'valid'; submitBase: string }
    | { status: 'invalid'; errors: Errors };

const validate = (
    name: string,
    submitUrl: string,
    surveyJson: string,
): Validation => {
    if (!name.startsWith(SURVEY_FLAG_PREFIX) || name === SURVEY_FLAG_PREFIX) {
        return {
            status: 'invalid',
            errors: {
                name: `Must start with "${SURVEY_FLAG_PREFIX}" followed by a name`,
            },
        };
    }
    const submitBase = parseSubmitBase(submitUrl);
    if (submitBase === null) {
        return {
            status: 'invalid',
            errors: {
                submitUrl: 'Enter a URL starting with http:// or https://',
            },
        };
    }
    if (!parseSurveyDefinition(surveyJson)) {
        return {
            status: 'invalid',
            errors: {
                survey: 'Not a valid survey. Check the kind, version, title and questions.',
            },
        };
    }
    return { status: 'valid', submitBase };
};

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
    const [surveyJson, setSurveyJson] = useState(
        JSON.stringify(SURVEY_TEMPLATE, null, 2),
    );
    const [errors, setErrors] = useState<Errors>({});

    if (!feedbackModuleEnabled) {
        return <NotFound />;
    }

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const validation = validate(name, submitUrl, surveyJson);
        if (validation.status === 'invalid') {
            setErrors(validation.errors);
            return;
        }
        setErrors({});
        const { submitBase } = validation;
        let result: CreateSurveyResult;
        try {
            result = await createSurvey(
                projectId,
                name,
                surveyJson,
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
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                />
                <Input
                    label='Submit URL'
                    description='The Unleash instance that collects the responses. Defaults to this one.'
                    value={submitUrl}
                    onChange={(event) =>
                        setSubmitUrl(event.target.value.trim())
                    }
                    error={Boolean(errors.submitUrl)}
                    errorText={errors.submitUrl}
                    fullWidth
                />
                <div>
                    <Typography variant='body2' sx={{ mb: 1 }}>
                        Survey
                    </Typography>
                    <Suspense fallback={null}>
                        <LazyReactJSONEditor
                            content={{ text: surveyJson }}
                            onChange={(content) =>
                                setSurveyJson(
                                    'text' in content
                                        ? content.text
                                        : JSON.stringify(content.json, null, 2),
                                )
                            }
                            validationError={errors.survey}
                        />
                    </Suspense>
                </div>
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
