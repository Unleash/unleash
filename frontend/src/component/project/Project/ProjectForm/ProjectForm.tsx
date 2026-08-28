import type React from 'react';
import { StickinessSelect } from 'component/feature/StrategyTypes/FlexibleStrategy/StickinessSelect/StickinessSelect';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { FeatureTogglesLimitTooltip } from './FeatureTogglesLimitTooltip.tsx';

interface IProjectForm {
    projectId: string;
    projectName: string;
    projectDesc: string;
    projectStickiness?: string;
    featureLimit?: string;
    setProjectStickiness?: React.Dispatch<React.SetStateAction<string>>;
    setProjectName: React.Dispatch<React.SetStateAction<string>>;
    setProjectDesc: React.Dispatch<React.SetStateAction<string>>;
    setFeatureLimit: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: (e: any) => void;
    errors: { [key: string]: string };
    children?: React.ReactNode;
}

const PROJECT_STICKINESS_SELECT = 'PROJECT_STICKINESS_SELECT';
const PROJECT_ID_INPUT = 'PROJECT_ID_INPUT';
const PROJECT_NAME_INPUT = 'PROJECT_NAME_INPUT';
const PROJECT_DESCRIPTION_INPUT = 'PROJECT_DESCRIPTION_INPUT';

const StyledForm = styled('form')(({ theme }) => ({
    height: '100%',
    paddingBottom: theme.spacing(1),
}));

const StyledSubtitle = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    paddingBottom: theme.spacing(1),
    '& span': {
        verticalAlign: 'bottom',
    },
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const ProjectForm: React.FC<IProjectForm> = ({
    children,
    handleSubmit,
    projectId,
    projectName,
    projectDesc,
    projectStickiness,
    featureLimit,
    setProjectName,
    setProjectDesc,
    setProjectStickiness,
    setFeatureLimit,
    errors,
}) => {
    return (
        <StyledForm
            onSubmit={(submitEvent) => {
                handleSubmit(submitEvent);
            }}
        >
            <StyledInput
                label='Project Id'
                value={projectId}
                disabled
                data-testid={PROJECT_ID_INPUT}
            />

            <StyledInput
                label='Project name'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                error={Boolean(errors.name)}
                errorText={errors.name}
                onFocus={() => {
                    delete errors.name;
                }}
                data-testid={PROJECT_NAME_INPUT}
                autoFocus
                required
            />

            <StyledInput
                label='Project description'
                multiline
                minRows={3}
                maxRows={4}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                data-testid={PROJECT_DESCRIPTION_INPUT}
            />

            <ConditionallyRender
                condition={setProjectStickiness != null}
                show={
                    <>
                        <StickinessSelect
                            label='Stickiness'
                            value={projectStickiness}
                            data-testid={PROJECT_STICKINESS_SELECT}
                            onChange={(e) =>
                                setProjectStickiness?.(e.target.value)
                            }
                        />
                    </>
                }
            />

            <StyledInput
                label='Feature flag limit'
                description={
                    <StyledSubtitle>
                        Leave this empty if you don’t want to add a limit{' '}
                        <FeatureTogglesLimitTooltip />
                    </StyledSubtitle>
                }
                name='value'
                type='number'
                value={
                    featureLimit === 'null' || featureLimit === undefined
                        ? ''
                        : featureLimit
                }
                onChange={(e) => setFeatureLimit(e.target.value)}
            />
            <StyledButtonContainer>{children}</StyledButtonContainer>
        </StyledForm>
    );
};

export default ProjectForm;
