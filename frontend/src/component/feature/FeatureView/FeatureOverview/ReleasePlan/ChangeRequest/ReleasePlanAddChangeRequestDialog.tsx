import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { styled, Button } from '@mui/material';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

const StyledBoldSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

interface IReleasePlanAddChangeRequestDialogProps {
    featureId: string;
    environmentId: string;
    releaseTemplate?: IReleasePlanTemplate;
    isOpen: boolean;
    onConfirm: () => Promise<void>;
    onClosing: () => void;
}

export const ReleasePlanAddChangeRequestDialog = ({
    featureId,
    environmentId,
    releaseTemplate,
    isOpen,
    onConfirm,
    onClosing,
}: IReleasePlanAddChangeRequestDialogProps) => {
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
            <p>
                <StyledBoldSpan>Add</StyledBoldSpan> release template{' '}
                <StyledBoldSpan>{releaseTemplate?.name}</StyledBoldSpan> to{' '}
                <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                <StyledBoldSpan>{environmentId}</StyledBoldSpan>
            </p>
        </Dialogue>
    );
};
