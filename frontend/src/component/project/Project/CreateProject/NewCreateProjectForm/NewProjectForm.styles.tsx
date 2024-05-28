import { Typography, styled } from '@mui/material';
import Input from 'component/common/Input/Input';
import { ReactComponent as ProjectIcon } from 'assets/icons/projectIconSmall.svg';

export const StyledForm = styled('form')(({ theme }) => ({
    background: theme.palette.background.default,
}));

export const StyledFormSection = styled('div')(({ theme }) => ({
    '& + *': {
        borderBlockStart: `1px solid ${theme.palette.divider}`,
    },

    padding: theme.spacing(6),
}));

export const TopGrid = styled(StyledFormSection)(({ theme }) => ({
    display: 'grid',
    gridTemplateAreas:
        '"icon header" "icon project-name" "icon project-description"',
    gridTemplateColumns: 'auto 1fr',
    gap: theme.spacing(4),
}));

export const StyledIcon = styled(ProjectIcon)(({ theme }) => ({
    fill: theme.palette.primary.main,
    stroke: theme.palette.primary.main,
}));

export const StyledHeader = styled(Typography)(({ theme }) => ({
    gridArea: 'header',
    alignSelf: 'center',
    fontWeight: 'lighter',
}));

export const ProjectNameContainer = styled('div')(({ theme }) => ({
    gridArea: 'project-name',
}));

export const ProjectDescriptionContainer = styled('div')(({ theme }) => ({
    gridArea: 'project-description',
}));

export const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    fieldset: { border: 'none' },
}));

export const OptionButtons = styled(StyledFormSection)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'row wrap',
    gap: theme.spacing(2),
}));

export const FormActions = styled(StyledFormSection)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(5),
    justifyContent: 'flex-end',
    flexFlow: 'row wrap',
}));
