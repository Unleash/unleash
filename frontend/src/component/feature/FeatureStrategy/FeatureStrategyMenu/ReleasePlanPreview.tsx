import type {
    IReleasePlan,
    IReleasePlanTemplate,
} from 'interfaces/releasePlans';
import { ReleasePlan } from '../../FeatureView/FeatureOverview/ReleasePlan/ReleasePlan.tsx';
import { useReleasePlanPreview } from 'hooks/useReleasePlanPreview';
import {
    styled,
    Typography,
    Alert,
    Box,
    DialogActions,
    Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature.ts';

const StyledScrollableContent = styled(Box)(({ theme }) => ({
    width: theme.breakpoints.values.md,
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
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

interface IReleasePlanPreviewProps {
    template: IReleasePlanTemplate;
    projectId: string;
    featureName: string;
    environment: string;
    environmentEnabled?: boolean;
    activeReleasePlan?: IReleasePlan;
    crProtected?: boolean;
    onConfirm: () => void;
    onBack: () => void;
}

export const ReleasePlanPreview = ({
    template,
    projectId,
    featureName,
    environment,
    activeReleasePlan,
    crProtected,
    onConfirm,
    onBack,
}: IReleasePlanPreviewProps) => {
    const { feature } = useFeature(projectId, featureName);
    const environmentData = feature?.environments.find(
        ({ name }) => name === environment,
    );
    const environmentEnabled = environmentData?.enabled;

    const planPreview = useReleasePlanPreview(
        template.id,
        featureName,
        environment,
    );

    return (
        <>
            <StyledSubHeader>
                <Button variant='text' onClick={onBack}>
                    <StyledBackIcon />
                    Go back
                </Button>
            </StyledSubHeader>
            <StyledScrollableContent>
                {activeReleasePlan && (
                    <Box sx={{ px: 4, pb: 2 }}>
                        <Alert severity='warning'>
                            This feature environment currently has{' '}
                            <strong>{activeReleasePlan.name}</strong> (
                            <strong>
                                {activeReleasePlan.milestones.find(
                                    ({ id }) =>
                                        activeReleasePlan.activeMilestoneId ===
                                        id,
                                )?.name ?? activeReleasePlan.milestones[0].name}
                            </strong>
                            ){environmentEnabled ? ' running' : ' paused'}.
                            Adding a new release plan will replace the existing
                            release plan.
                        </Alert>
                    </Box>
                )}
                <Box sx={{ px: 2 }}>
                    <ReleasePlan
                        plan={planPreview}
                        onAutomationChange={() => {}}
                        readonly
                    />
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
        </>
    );
};
