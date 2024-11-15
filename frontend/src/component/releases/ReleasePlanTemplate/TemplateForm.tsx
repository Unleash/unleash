import Input from 'component/common/Input/Input';
import { Box, Card, styled } from '@mui/material';

const StyledInputDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const StyledInput = styled(Input)(({ theme }) => ({
    width: '100%',
    marginBottom: theme.spacing(2),
}));

export const StyledMilestoneCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
    transition: 'background-color 0.2s ease-in-out',
    backgroundColor: theme.palette.background.default,
    '&:hover': {
        backgroundColor: theme.palette.neutral.light,
    },
    borderRadius: theme.shape.borderRadiusMedium,
}));

export const StyledMilestoneCardBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 2),
}));

export const StyledMilestoneCardTitle = styled('span')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.bodySize,
}));

interface ITemplateForm {
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    description: string;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    errors: { [key: string]: string };
    clearErrors: () => void;
}

export const TemplateForm: React.FC<ITemplateForm> = ({
    name,
    setName,
    description,
    setDescription,
    errors,
    clearErrors,
}) => {
    return (
        <>
            <StyledInputDescription>
                What would you like to call your template?
            </StyledInputDescription>
            <StyledInput
                label='Template name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={Boolean(errors.name)}
                errorText={errors.name}
                onFocus={() => clearErrors()}
                autoFocus
            />
            <StyledInputDescription>
                What's the purpose of this template?
            </StyledInputDescription>
            <StyledInput
                label='Template description (optional)'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={Boolean(errors.description)}
                errorText={errors.description}
                onFocus={() => clearErrors()}
            />
        </>
    );
};
