import {
    Button,
    MenuItem,
    Select,
    TextField,
    Typography,
    styled,
} from '@mui/material';
import { GO_BACK } from 'constants/navigate';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import { CREATE_PROJECT } from 'component/providers/AccessProvider/permissions';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIconSmall.svg';

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
        '"icon header template" "icon project-name project-name" "icon description description"',
    gridTemplateColumns: 'minmax(auto, 50px) 1fr auto',
    gap: theme.spacing(2),
}));

const StyledIcon = styled(ProjectIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    gridArea: 'header',
    fontWeight: 'lighter',
}));

const StyledTemplateSelector = styled(Select)(({ theme }) => ({
    gridArea: 'template',
}));

const StyledInput = styled(TextField)(({ theme }) => ({
    width: '100%',
    margin: 0,
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

const CREATE_PROJECT_BTN = 'CREATE_PROJECT_BTN';

export const NewProjectForm = () => {
    const navigate = useNavigate();

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <StyledForm>
            <TopGrid>
                <StyledIcon aria-hidden='true' />
                <StyledHeader variant='h2'>New project</StyledHeader>
                <StyledTemplateSelector
                    id='template-selector'
                    value={'none'}
                    label='Project creation template'
                    name='Project creation template'
                >
                    <MenuItem value={'none'}>No template</MenuItem>
                </StyledTemplateSelector>
                <StyledProjectName label='Project name' required />
                <StyledProjectDescription
                    label='Description (optional)'
                    multiline
                />
            </TopGrid>
            <OptionButtons>
                <Button variant='outlined'>4 selected</Button>
                <Button variant='outlined'>clientId</Button>
                <Button variant='outlined'>Open</Button>
                <Button variant='outlined'>1 environment configured</Button>
            </OptionButtons>
            <FormActions>
                <Button onClick={handleCancel}>Cancel</Button>

                <CreateButton
                    name='project'
                    permission={CREATE_PROJECT}
                    data-testid={CREATE_PROJECT_BTN}
                />
            </FormActions>
        </StyledForm>
    );
};
