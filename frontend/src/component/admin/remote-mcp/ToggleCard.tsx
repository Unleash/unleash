import type { ReactNode } from 'react';
import {
    Box,
    FormControlLabel,
    styled,
    Switch,
    Typography,
} from '@mui/material';

const StyledCard = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

const StyledCardLeft = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    maxWidth: '75%',
}));

const StyledCardRight = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexShrink: 0,
}));

const StyledTitle = styled(Typography)({
    fontWeight: 'bold',
});

export const ToggleCardDescription = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body2.fontSize,
}));

interface IToggleCardProps {
    title: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    children: ReactNode;
}

export const ToggleCard = ({
    title,
    checked,
    onChange,
    disabled = false,
    children,
}: IToggleCardProps) => (
    <StyledCard>
        <StyledCardLeft>
            <StyledTitle variant='body1'>{title}</StyledTitle>
            {children}
        </StyledCardLeft>
        <StyledCardRight>
            <FormControlLabel
                sx={{ margin: 0 }}
                control={
                    <Switch
                        slotProps={{ input: { 'aria-label': title } }}
                        onChange={(_, isChecked) => onChange(isChecked)}
                        checked={checked}
                        disabled={disabled}
                    />
                }
                label={checked ? 'Enabled' : 'Disabled'}
            />
        </StyledCardRight>
    </StyledCard>
);
