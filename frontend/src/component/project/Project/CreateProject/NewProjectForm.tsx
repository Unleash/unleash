import { v4 as uuidv4 } from 'uuid';
import {
    Button,
    MenuItem,
    Select,
    TextField,
    Typography,
    styled,
} from '@mui/material';

const StyledContainer = styled('form')(({ theme }) => ({
    background: theme.palette.background.default,

    '> * + *': {
        borderBlockStart: `1px solid ${theme.palette.divider}`,
    },

    '> *': {
        padding: theme.spacing(7),
    },
}));

const TopGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas:
        '"icon header template" "icon project-name project-name" "icon description description"',
    gridTemplateColumns: 'minmax(auto, 50px) 1fr auto',
    gap: theme.spacing(2),

    '> span.icon': {
        border: `1px solid ${theme.palette.primary.main}`,
        width: `100%`,
        aspectRatio: '1',
        borderRadius: theme.shape.borderRadius,
    },

    '> h2': {
        gridArea: 'header',
    },

    '> span.input': {
        gridArea: 'template',
    },

    '.project-name': {
        gridArea: 'project-name',
        margin: 0,
    },

    '.project-name *': {
        fontSize: theme.typography.h1.fontSize,
    },

    '.description': {
        gridArea: 'description',
        margin: 0,
    },

    '.description *': {
        fontSize: theme.typography.h2.fontSize,
    },
}));

const OptionButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
}));

const StyledInput = styled(TextField)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
    paddingRight: theme.spacing(1),

    fieldset: { border: 'none' },
}));

const FormActions = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(5),
    justifyContent: 'flex-end',
}));

const CREATE_PROJECT_BTN = 'CREATE_PROJECT_BTN';

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
        const maybeProjectId = input
            ? `${encodeURIComponent(input.trim())}-${uuidv4().slice(-12)}`
            : '';
        setProjectId(maybeProjectId);
    };

    return (
        <StyledContainer
            onSubmit={(submitEvent) => {
                handleSubmit(submitEvent);
            }}
        >
            <TopGrid>
                <span className='icon'>icon</span>
                <Typography variant='h2'>New project</Typography>
                <Select
                    className='input'
                    id='template-selector'
                    value={'none'}
                    label='Project creation template'
                    name='Project creation template'
                >
                    <MenuItem value={'none'}>No template</MenuItem>
                </Select>
                <StyledInput
                    className='project-name'
                    label='Project name'
                    value={projectName}
                    onChange={handleProjectNameUpdate}
                    error={Boolean(errors.name)}
                    errorText={errors.name}
                    onFocus={() => {
                        delete errors.name;
                    }}
                    data-testid={PROJECT_NAME_INPUT}
                    required
                    autoFocus
                    InputProps={{
                        classes: {
                            input: 'project-name-input',
                        },
                    }}
                />
                <StyledInput
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
        </StyledContainer>
    );
};
