import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { styled, Button, Alert } from '@mui/material';
import type { IReleasePlan } from 'interfaces/releasePlans';

const StyledBoldSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

interface IRemoveReleasePlanChangeRequestDialogProps {
    featureId: string;
    environmentId: string;
    releasePlan?: IReleasePlan | undefined;
    environmentActive: boolean;
    isOpen: boolean;
    onConfirm: () => Promise<void>;
    onClosing: () => void;
}

export const RemoveReleasePlanChangeRequestDialog = ({
    featureId,
    environmentId,
    releasePlan,
    environmentActive,
    isOpen,
    onConfirm,
    onClosing,
}: IRemoveReleasePlanChangeRequestDialogProps) => {
    return (
        <Dialogue
            title='Request changes'
            open={isOpen}
            secondaryButtonText='Cancel'
            onClose={onClosing}
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
            <>
                {environmentActive && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                        This release plan currently has one active milestone.
                        Removing the release plan will change which users
                        receive access to the feature.
                    </Alert>
                )}
                <p>
                    <StyledBoldSpan>Remove</StyledBoldSpan> release plan{' '}
                    <StyledBoldSpan>{releasePlan?.name}</StyledBoldSpan> from{' '}
                    <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                    <StyledBoldSpan>{environmentId}</StyledBoldSpan>
                </p>
            </>
        </Dialogue>
    );
};
