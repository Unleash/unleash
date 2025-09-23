import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { ReleasePlan } from './ReleasePlan.tsx';
import { useReleasePlanPreview } from 'hooks/useReleasePlanPreview';
import {
    styled,
    Typography,
    Alert,
    Box,
    IconButton,
    Dialog,
    DialogActions,
    Button,
} from '@mui/material';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useReleasePlans } from 'hooks/api/getters/useReleasePlans/useReleasePlans';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
    },
}));

const StyledScrollableContent = styled(Box)(({ theme }) => ({
    width: theme.breakpoints.values.md,
    minHeight: '318px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(4, 4, 2, 4),
}));

const StyledSubHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0, 3, 3, 3),
}));

const StyledBackIcon = styled(ArrowBackIcon)(({ theme }) => ({
    marginRight: theme.spacing(1),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: theme.spacing(2, 4, 4),
}));

interface IReleasePlanAddDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
    template: IReleasePlanTemplate;
    projectId: string;
    featureName: string;
    environment: string;
    crProtected?: boolean;
}

export const ReleasePlanReviewDialog = ({
    open,
    setOpen,
    onConfirm,
    template,
    projectId,
    featureName,
    environment,
    crProtected,
}: IReleasePlanAddDialogProps) => {
    const { feature } = useFeature(projectId, featureName);
    const { releasePlans } = useReleasePlans(
        projectId,
        featureName,
        environment,
    );

    const activeReleasePlan = releasePlans[0];

    const environmentData = feature?.environments.find(
        ({ name }) => name === environment,
    );
    const environmentEnabled = environmentData?.enabled;

    const planPreview = useReleasePlanPreview(
        template.id,
        featureName,
        environment,
    );

    const handleClose = () => setOpen(false);

    return (
        <StyledDialog open={open} onClose={handleClose} fullWidth maxWidth='md'>
            <StyledHeader>
                <Typography variant='h2'>Add strategy</Typography>
                <IconButton
                    size='small'
                    onClick={handleClose}
                    edge='end'
                    aria-label='close'
                >
                    <CloseIcon fontSize='small' />
                </IconButton>
            </StyledHeader>
            <StyledSubHeader>
                <Button variant='text' onClick={handleClose}>
                    <StyledBackIcon />
                    Go back
                </Button>
            </StyledSubHeader>
            <StyledScrollableContent>
                {activeReleasePlan && (
                    <Box sx={{ px: 4, pb: 2 }}>
                        <Alert severity='error'>
                            This feature environment currently has{' '}
                            <strong>{activeReleasePlan.name}</strong> -{' '}
                            <strong>
                                {activeReleasePlan.milestones[0].name}
                            </strong>
                            {environmentEnabled ? ' running' : ' paused'}.
                            Adding a new release plan will replace the existing
                            release plan.
                        </Alert>
                    </Box>
                )}
                <Box sx={{ px: 2 }}>
                    <ReleasePlan plan={planPreview} readonly />
                </Box>
                {crProtected && (
                    <Box sx={{ px: 4, pt: 1 }}>
                        <Typography>
                            <strong>Adding</strong> release template{' '}
                            <strong>{template?.name}</strong> to{' '}
                            <strong>{featureName}</strong> in{' '}
                            <strong>{environment}</strong>.
                        </Typography>
                    </Box>
                )}
            </StyledScrollableContent>
            <StyledDialogActions>
                <Button variant='contained' color='primary' onClick={onConfirm}>
                    {crProtected ? 'Add suggestion to draft' : 'Apply template'}
                </Button>
            </StyledDialogActions>
        </StyledDialog>
    );
};
