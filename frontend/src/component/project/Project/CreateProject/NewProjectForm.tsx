import { Button, Typography, styled } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import Input from 'component/common/Input/Input';

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
        '"icon header " "icon project-name " "icon description "',
    gridTemplateColumns: 'minmax(auto, 50px) 1fr',
    gap: theme.spacing(2),
}));

const StyledIcon = styled('span')(({ theme }) => ({
    border: `1px solid ${theme.palette.primary.main}`,
    width: `100%`,
    aspectRatio: '1',
    borderRadius: theme.shape.borderRadius,
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    gridArea: 'header',
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    fieldset: { border: 'none' },
}));

const StyledProjectName = styled(StyledInput)(({ theme }) => ({
    gridArea: 'project-name',
    '*': { fontSize: theme.typography.h1.fontSize },
}));

const StyledProjectDescription = styled(StyledInput)(({ theme }) => ({
    gridArea: 'description',
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
    projectStickiness?: string;
    featureLimit?: string;
    featureCount?: number;
    projectMode?: string;
    setProjectStickiness?: React.Dispatch<React.SetStateAction<string>>;
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
    featureLimit,
    featureCount,
    projectMode,
    setProjectMode,
    setProjectId,
    setProjectName,
    setProjectDesc,
    setProjectStickiness,
    setFeatureLimit,
    errors,
    mode,
    clearErrors,
}) => {
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

    return (
        <StyledForm
            onSubmit={(submitEvent) => {
                handleSubmit(submitEvent);
            }}
        >
            <TopGrid>
                <StyledIcon>icon</StyledIcon>
                <StyledHeader variant='h2'>New project</StyledHeader>
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
                <StyledProjectDescription
                    className='description'
                    label='Description (optional)'
                    multiline
                    maxRows={20}
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    data-testid={PROJECT_DESCRIPTION_INPUT}
                />
            </TopGrid>
            <OptionButtons>
                <Button variant='outlined'>4 selected</Button>
                <Button variant='outlined'>clientId</Button>
                <Button variant='outlined'>Open</Button>
                <Button variant='outlined'>1 environment configured</Button>
            </OptionButtons>
            <FormActions>{children}</FormActions>
        </StyledForm>
    );
};
