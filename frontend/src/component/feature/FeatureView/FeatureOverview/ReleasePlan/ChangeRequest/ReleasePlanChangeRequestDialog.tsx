import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { styled, Button, Alert } from '@mui/material';
import type {
    IReleasePlan,
    IReleasePlanMilestone,
} from 'interfaces/releasePlans';
import type { ChangeMilestoneProgressionSchema } from 'openapi';
import { getTimeValueAndUnitFromMinutes } from '../hooks/useMilestoneProgressionForm.js';

const StyledBoldSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

type ChangeRequestAction =
    | {
          type: 'removeReleasePlan';
          environmentActive: boolean;
      }
    | {
          type: 'startMilestone';
          milestone: IReleasePlanMilestone;
      }
    | {
          type: 'changeMilestoneProgression';
          payload: ChangeMilestoneProgressionSchema;
      }
    | {
          type: 'deleteMilestoneProgression';
          sourceMilestoneId: string;
      };

interface IReleasePlanChangeRequestDialogProps {
    featureId: string;
    environmentId: string;
    releasePlan: IReleasePlan;
    action: ChangeRequestAction | null;
    isOpen: boolean;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

export const ReleasePlanChangeRequestDialog = ({
    featureId,
    environmentId,
    releasePlan,
    action,
    isOpen,
    onConfirm,
    onClose,
}: IReleasePlanChangeRequestDialogProps) => {
    if (!action) return null;

    const renderContent = () => {
        switch (action.type) {
            case 'removeReleasePlan':
                return (
                    <>
                        {action.environmentActive && (
                            <Alert severity='error' sx={{ mb: 2 }}>
                                This release plan currently has one active
                                milestone. Removing the release plan will change
                                which users receive access to the feature.
                            </Alert>
                        )}
                        <p>
                            <StyledBoldSpan>Remove</StyledBoldSpan> release plan{' '}
                            <StyledBoldSpan>{releasePlan.name}</StyledBoldSpan>{' '}
                            from <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                            <StyledBoldSpan>{environmentId}</StyledBoldSpan>
                        </p>
                    </>
                );

            case 'startMilestone':
                return (
                    <p>
                        <StyledBoldSpan>Start</StyledBoldSpan> milestone{' '}
                        <StyledBoldSpan>{action.milestone.name}</StyledBoldSpan>{' '}
                        in release plan{' '}
                        <StyledBoldSpan>{releasePlan.name}</StyledBoldSpan> for{' '}
                        <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                        <StyledBoldSpan>{environmentId}</StyledBoldSpan>
                    </p>
                );

            case 'changeMilestoneProgression': {
                const sourceMilestone = releasePlan.milestones.find(
                    (milestone) =>
                        milestone.id === action.payload.sourceMilestone,
                );
                const targetMilestone = releasePlan.milestones.find(
                    (milestone) =>
                        milestone.id === action.payload.targetMilestone,
                );

                const { value, unit } = getTimeValueAndUnitFromMinutes(
                    action.payload.transitionCondition.intervalMinutes,
                );
                const timeInterval = `${value} ${unit}`;

                return (
                    <p>
                        Configure automation to proceed from{' '}
                        <StyledBoldSpan>{sourceMilestone?.name}</StyledBoldSpan>{' '}
                        to{' '}
                        <StyledBoldSpan>{targetMilestone?.name}</StyledBoldSpan>{' '}
                        after <StyledBoldSpan>{timeInterval}</StyledBoldSpan> in{' '}
                        {environmentId}
                    </p>
                );
            }

            case 'deleteMilestoneProgression': {
                const milestone = releasePlan.milestones.find(
                    (milestone) => milestone.id === action.sourceMilestoneId,
                );

                return (
                    <p>
                        <StyledBoldSpan>Remove</StyledBoldSpan> automation that
                        progresses from{' '}
                        <StyledBoldSpan>{milestone?.name}</StyledBoldSpan> to
                        the next milestone in{' '}
                        <StyledBoldSpan>{environmentId}</StyledBoldSpan>
                    </p>
                );
            }
        }
    };

    return (
        <Dialogue
            title='Request changes'
            open={isOpen}
            secondaryButtonText='Cancel'
            onClose={onClose}
            customButton={
                <Button
                    color='primary'
                    variant='contained'
                    onClick={onConfirm}
                    autoFocus={true}
                >
                    Add suggestion to draft
                </Button>
            }
        >
            {renderContent()}
        </Dialogue>
    );
};
