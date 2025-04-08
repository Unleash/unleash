import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { ReleasePlan } from './ReleasePlan';
import { useReleasePlanPreview } from 'hooks/useReleasePlanPreview';
import {
    styled,
    Typography,
    Alert,
    Box,
    IconButton,
    Dialog,
    DialogContent,
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
        maxWidth: theme.spacing(85),
    },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: theme.spacing(2, 4, 4),
}));

const TitleRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const BackButton = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
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
            <DialogContent>
                <TitleRow>
                    <BackButton onClick={handleClose}>
                        <ArrowBackIcon
                            sx={{
                                mr: 1,
                                color: (theme) => theme.palette.primary.main,
                            }}
                        />
                        <Typography
                            variant='body2'
                            color='primary'
                            sx={{
                                fontWeight: (theme) =>
                                    theme.typography.fontWeightMedium,
                            }}
                        >
                            Go back
                        </Typography>
                    </BackButton>
                    <IconButton
                        size='small'
                        onClick={handleClose}
                        edge='end'
                        aria-label='close'
                    >
                        <CloseIcon fontSize='small' />
                    </IconButton>
                </TitleRow>

                {activeReleasePlan && (
                    <Alert severity='error' sx={{ mb: 1 }}>
                        This feature environment currently has{' '}
                        <strong>{activeReleasePlan.name}</strong> -{' '}
                        <strong>{activeReleasePlan.milestones[0].name}</strong>
                        {environmentEnabled ? ' running' : ' paused'}. Adding a
                        new release plan will replace the existing release plan.
                    </Alert>
                )}
                <div>
                    <ReleasePlan plan={planPreview} readonly />
                </div>
                {crProtected && (
                    <Typography sx={{ mt: 4 }}>
                        <strong>Adding</strong> release template{' '}
                        <strong>{template?.name}</strong> to{' '}
                        <strong>{featureName}</strong> in{' '}
                        <strong>{environment}</strong>.
                    </Typography>
                )}
            </DialogContent>
            <StyledDialogActions>
                <Button variant='contained' color='primary' onClick={onConfirm}>
                    {crProtected ? 'Add suggestion to draft' : 'Use template'}
                </Button>
            </StyledDialogActions>
        </StyledDialog>
    );
};
