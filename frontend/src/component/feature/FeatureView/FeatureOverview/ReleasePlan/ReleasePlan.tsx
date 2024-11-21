import Delete from '@mui/icons-material/Delete';
import { styled } from '@mui/material';
import { DELETE_FEATURE_STRATEGY } from '@server/types/permissions';
import PermissionIconButton from 'component/common/PermissionIconButton/PermissionIconButton';
import { useReleasePlansApi } from 'hooks/api/actions/useReleasePlansApi/useReleasePlansApi';
import { useReleasePlans } from 'hooks/api/getters/useReleasePlans/useReleasePlans';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useToast from 'hooks/useToast';
import type { IReleasePlan } from 'interfaces/releasePlans';
import { useState } from 'react';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ReleasePlanRemoveDialog } from './ReleasePlanRemoveDialog';
import { ReleasePlanMilestone } from './ReleasePlanMilestone';

const StyledContainer = styled('div', {
    shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean }>(({ theme, disabled }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    '& + &': {
        marginTop: theme.spacing(2),
    },
    background: disabled
        ? theme.palette.envAccordion.disabled
        : theme.palette.background.paper,
}));

const StyledHeader = styled('div', {
    shouldForwardProp: (prop) => prop !== 'disabled',
})<{ disabled?: boolean }>(({ theme, disabled }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    color: disabled ? theme.palette.text.secondary : theme.palette.text.primary,
}));

const StyledHeaderTitleContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: theme.spacing(1),
}));

const StyledHeaderTitleLabel = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    lineHeight: 0.5,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
}));

const StyledHeaderDescription = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    lineHeight: 0.5,
    color: theme.palette.text.secondary,
}));

const StyledBody = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(3),
}));

interface IReleasePlanProps {
    plan: IReleasePlan;
}

export const ReleasePlan = ({ plan }: IReleasePlanProps) => {
    const {
        id,
        name,
        description,
        activeMilestoneId,
        featureName,
        environment,
        milestones,
    } = plan;

    const projectId = useRequiredPathParam('projectId');
    const { refetch } = useReleasePlans(projectId, featureName, environment);
    const { removeReleasePlanFromFeature } = useReleasePlansApi();
    const { setToastData, setToastApiError } = useToast();

    const [removeOpen, setRemoveOpen] = useState(false);

    const onRemoveConfirm = async () => {
        try {
            await removeReleasePlanFromFeature(
                projectId,
                featureName,
                environment,
                id,
            );
            setToastData({
                title: `Release plan "${name}" has been removed from ${featureName} in ${environment}`,
                type: 'success',
            });
            refetch();
            setRemoveOpen(false);
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const disabled = !activeMilestoneId;
    const activeIndex = milestones.findIndex(
        (milestone) => milestone.id === activeMilestoneId,
    );

    return (
        <StyledContainer disabled={disabled}>
            <StyledHeader disabled={disabled}>
                <StyledHeaderTitleContainer>
                    <StyledHeaderTitleLabel>
                        Release plan
                    </StyledHeaderTitleLabel>
                    <span>{name}</span>
                    <StyledHeaderDescription>
                        {description}
                    </StyledHeaderDescription>
                </StyledHeaderTitleContainer>
                <PermissionIconButton
                    onClick={() => setRemoveOpen(true)}
                    permission={DELETE_FEATURE_STRATEGY}
                    environmentId={environment}
                    projectId={projectId}
                    tooltipProps={{
                        title: 'Remove release plan',
                    }}
                >
                    <Delete />
                </PermissionIconButton>
            </StyledHeader>
            <StyledBody>
                {milestones.map((milestone, index) => (
                    <ReleasePlanMilestone
                        key={milestone.id}
                        milestone={milestone}
                        status={
                            index === activeIndex
                                ? 'active'
                                : index < activeIndex
                                  ? 'completed'
                                  : 'not-started'
                        }
                    />
                ))}
            </StyledBody>
            <ReleasePlanRemoveDialog
                plan={plan}
                open={removeOpen}
                setOpen={setRemoveOpen}
                onConfirm={onRemoveConfirm}
            />
        </StyledContainer>
    );
};
