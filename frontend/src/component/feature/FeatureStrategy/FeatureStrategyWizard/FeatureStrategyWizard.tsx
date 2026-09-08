import { Box, Dialog, IconButton, styled, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { StrategySetupCards } from './StrategySetupCards.tsx';

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(4, 4, 2, 4),
}));

interface IFeatureStrategyWizardProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    open: boolean;
    onClose: () => void;
}

export const FeatureStrategyWizard = ({
    projectId,
    featureId,
    environmentId,
    open,
    onClose,
}: IFeatureStrategyWizardProps) => (
    <Dialog
        open={open}
        onClose={onClose}
        maxWidth='md'
        slotProps={{
            paper: {
                sx: {
                    borderRadius: '12px',
                    height: 'auto',
                    width: '100%',
                },
            },
        }}
    >
        <StyledHeader>
            <Typography variant='h2'>Add strategy</Typography>
            <IconButton
                size='medium'
                onClick={onClose}
                edge='end'
                aria-label='close'
            >
                <CloseIcon />
            </IconButton>
        </StyledHeader>
        <StrategySetupCards
            projectId={projectId}
            featureId={featureId}
            environmentId={environmentId}
            onClose={onClose}
        />
    </Dialog>
);
