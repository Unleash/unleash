import { Button, Typography, styled } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import Input from 'component/common/Input/Input';
import type { ProjectMode } from '../hooks/useProjectEnterpriseSettingsForm';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIconSmall.svg';
import { FilterItem, FilterItemSingleSelect } from './SelectionButton';
import { useEnvironments } from 'hooks/api/getters/useEnvironments/useEnvironments';
import { useStickinessOptions } from '../hooks/useStickinessOptions';
import FormatPaint from '@mui/icons-material/FormatPaint';

const StyledForm = styled('form')(({ theme }) => ({
    background: theme.palette.background.default,
}));

const StyledFormSection = styled('div')(({ theme }) => ({
    '& + *': {
        borderBlockStart: `1px solid ${theme.palette.divider}`,
    },

    padding: theme.spacing(7),
}));

const TopGrid = styled(StyledFormSection)(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas:
        '"icon header" "icon project-name" "icon project-description"',
    gridTemplateColumns: 'auto 1fr',
    gap: theme.spacing(2),
}));

const StyledIcon = styled(ProjectIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    gridArea: 'header',
    alignSelf: 'center',
    fontWeight: 'lighter',
}));

const ProjectNameContainer = styled('div')(({ theme }) => ({
    gridArea: 'project-name',
}));

const ProjectDescriptionContainer = styled('div')(({ theme }) => ({
    gridArea: 'project-description',
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    fieldset: { border: 'none' },
}));

const StyledProjectName = styled(StyledInput)(({ theme }) => ({
    '*': { fontSize: theme.typography.h1.fontSize },
}));

const StyledProjectDescription = styled(StyledInput)(({ theme }) => ({
    '*': { fontSize: theme.typography.h2.fontSize },
}));

const OptionButtons = styled(StyledFormSection)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
}));

const FormActions = styled(StyledFormSection)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(5),
    justifyContent: 'flex-end',
}));

type FormProps = {
    projectId: string;
    projectName: string;
    projectDesc: string;
    projectStickiness: string;
    featureLimit?: string;
    featureCount?: number;
    projectMode?: string;
    projectEnvironments: Set<string>;
    setProjectStickiness: React.Dispatch<React.SetStateAction<string>>;
    setProjectEnvironments: React.Dispatch<React.SetStateAction<Set<string>>>;
    setProjectId: React.Dispatch<React.SetStateAction<string>>;
    setProjectName: React.Dispatch<React.SetStateAction<string>>;
    setProjectDesc: React.Dispatch<React.SetStateAction<string>>;
    setFeatureLimit?: React.Dispatch<React.SetStateAction<string>>;
    setProjectMode?: React.Dispatch<React.SetStateAction<ProjectMode>>;
    handleSubmit: (e: any) => void;
    errors: { [key: string]: string };
    mode: 'Create' | 'Edit';
    clearErrors: () => void;
    validateProjectId: () => void;
};

const PROJECT_NAME_INPUT = 'PROJECT_NAME_INPUT';
const PROJECT_DESCRIPTION_INPUT = 'PROJECT_DESCRIPTION_INPUT';

export const NewProjectForm: React.FC<FormProps> = ({
    children,
    handleSubmit,
    projectName,
    projectDesc,
    projectStickiness,
    projectEnvironments,
    featureLimit,
    featureCount,
    projectMode,
    setProjectMode,
    setProjectEnvironments,
    setProjectId,
    setProjectName,
    setProjectDesc,
    setProjectStickiness,
    setFeatureLimit,
    errors,
    mode,
    clearErrors,
}) => {
    const { environments: allEnvironments } = useEnvironments();
    const activeEnvironments = allEnvironments.filter((env) => env.enabled);

    const handleProjectNameUpdate = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const input = e.target.value;
        setProjectName(input);

        // todo: handle this in a real manner. This is a hack for now.
        const maybeProjectId = input
            ? `${encodeURIComponent(input.trim())}-${uuidv4().slice(-12)}`
            : '';
        setProjectId(maybeProjectId);
    };

    const handleFilterChange = (envs: Set<string>) => {
        setProjectEnvironments(envs);
    };

    const projectModeOptions = [
        { key: 'open', label: 'open' },
        { key: 'protected', label: 'protected' },
        { key: 'private', label: 'private' },
    ];

    const stickinessOptions = useStickinessOptions(projectStickiness);

    return (
        <StyledForm
            onSubmit={(submitEvent) => {
                handleSubmit(submitEvent);
            }}
        >
            <TopGrid>
                <StyledIcon aria-hidden='true' />
                <StyledHeader variant='h2'>New project</StyledHeader>
                <ProjectNameContainer>
                    <StyledProjectName
                        label='Project name'
                        required
                        value={projectName}
                        onChange={handleProjectNameUpdate}
                        error={Boolean(errors.name)}
                        errorText={errors.name}
                        onFocus={() => {
                            delete errors.name;
                        }}
                        data-testid={PROJECT_NAME_INPUT}
                        autoFocus
                    />
                </ProjectNameContainer>
                <ProjectDescriptionContainer>
                    <StyledProjectDescription
                        className='description'
                        label='Description (optional)'
                        multiline
                        maxRows={20}
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        data-testid={PROJECT_DESCRIPTION_INPUT}
                    />
                </ProjectDescriptionContainer>
            </TopGrid>
            <OptionButtons>
                <FilterItem
                    label='Environments'
                    selectedOptions={projectEnvironments}
                    options={activeEnvironments.map((env) => ({
                        label: env.name,
                        value: env.name,
                    }))}
                    onChange={handleFilterChange}
                />

                <FilterItemSingleSelect
                    options={stickinessOptions.map(({ key, ...rest }) => ({
                        value: key,
                        ...rest,
                    }))}
                    onChange={(value: any) => {
                        setProjectStickiness(value);
                    }}
                    button={{
                        label: projectStickiness,
                        icon: <FormatPaint />,
                    }}
                />

                <Button variant='outlined'>clientId</Button>
                <Button variant='outlined'>Open</Button>
                <Button variant='outlined'>1 environment configured</Button>
            </OptionButtons>
            <FormActions>{children}</FormActions>
        </StyledForm>
    );
};
