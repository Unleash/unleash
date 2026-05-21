import type { FC } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    styled,
} from '@mui/material';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import type { ViewTemplate } from './types';

const StyledOptions = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
}));

const StyledOption = styled('button')(({ theme }) => ({
    all: 'unset',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    padding: theme.spacing(2.5),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.paper,
    transition: 'border-color 120ms ease, background-color 120ms ease',
    '&:hover, &:focus-visible': {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.background.elevation1,
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
    },
}));

const StyledOptionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledOptionIcon = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    color: theme.palette.primary.main,
    '& svg': { fontSize: 22 },
}));

const StyledOptionTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledOptionDescription = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

export type TemplatePickerDialogProps = {
    open: boolean;
    onSelect: (template: ViewTemplate) => void;
    onClose: () => void;
};

export const TemplatePickerDialog: FC<TemplatePickerDialogProps> = ({
    open,
    onSelect,
    onClose,
}) => (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
        <DialogTitle>Pick a template</DialogTitle>
        <DialogContent>
            <Typography
                variant='body2'
                sx={{ color: 'text.secondary', mb: 0.5 }}
            >
                Templates seed sensible defaults for the view&rsquo;s job. You
                can always tweak everything in the editor.
            </Typography>
            <StyledOptions>
                <StyledOption
                    type='button'
                    onClick={() => onSelect('goal-tracking')}
                >
                    <StyledOptionHeader>
                        <StyledOptionIcon>
                            <FlagOutlinedIcon />
                        </StyledOptionIcon>
                        <StyledOptionTitle>Goal tracking</StyledOptionTitle>
                    </StyledOptionHeader>
                    <StyledOptionDescription>
                        One goal metric with leading-indicator signals on a
                        single chart. Defaults to a 30-day window with
                        normalized series so small and large numbers stay
                        readable together.
                    </StyledOptionDescription>
                </StyledOption>
                <StyledOption
                    type='button'
                    onClick={() => onSelect('system-health')}
                >
                    <StyledOptionHeader>
                        <StyledOptionIcon>
                            <MonitorHeartOutlinedIcon />
                        </StyledOptionIcon>
                        <StyledOptionTitle>System health</StyledOptionTitle>
                    </StyledOptionHeader>
                    <StyledOptionDescription>
                        One chart per metric, each with its own axis. Auto-
                        follows flags with state changes in the selected
                        environment so you can spot &ldquo;what changed?&rdquo;
                        quickly.
                    </StyledOptionDescription>
                </StyledOption>
            </StyledOptions>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
    </Dialog>
);
