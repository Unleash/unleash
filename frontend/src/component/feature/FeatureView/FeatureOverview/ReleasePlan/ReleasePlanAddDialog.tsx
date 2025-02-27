import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';
import { ReleasePlan } from './ReleasePlan';
import { useReleasePlanPreview } from 'hooks/useReleasePlanPreview';
import { styled, Typography, Alert } from '@mui/material';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';

const StyledReleasePlanContainer = styled('div')(({ theme }) => ({
    margin: theme.spacing(2, 0),
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

export const ReleasePlanAddDialog = ({
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

    const environmentData = feature?.environments.find(
        ({ name }) => name === environment,
    );
    const environmentEnabled = environmentData?.enabled;

    const planPreview = useReleasePlanPreview(
        template.id,
        featureName,
        environment,
    );

    const firstMilestone = planPreview.milestones[0];

    return (
        <Dialogue
            title='Add release plan?'
            open={open}
            primaryButtonText={
                crProtected ? 'Add suggestion to draft' : 'Add release plan'
            }
            secondaryButtonText='Cancel'
            onClick={onConfirm}
            onClose={() => setOpen(false)}
        >
            {environmentEnabled ? (
                <Alert severity='info'>
                    This environment is currently <strong>enabled</strong>.
                    {firstMilestone && (
                        <p>
                            The first milestone will be started as soon as the
                            release plan is added:{' '}
                            <strong>{planPreview.milestones[0].name}</strong>
                        </p>
                    )}
                </Alert>
            ) : (
                <Alert severity='warning'>
                    This environment is currently <strong>disabled</strong>.
                    <p>
                        The milestones will not start automatically after adding
                        the release plan. They will remain paused until the
                        environment is enabled.
                    </p>
                </Alert>
            )}
            <StyledReleasePlanContainer>
                <ReleasePlan plan={planPreview} readonly />
            </StyledReleasePlanContainer>
            {crProtected && (
                <Typography sx={{ mt: 4 }}>
                    <strong>Adding</strong> release plan template{' '}
                    <strong>{template?.name}</strong> to{' '}
                    <strong>{featureName}</strong> in{' '}
                    <strong>{environment}</strong>.
                </Typography>
            )}
        </Dialogue>
    );
};
