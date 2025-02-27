import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { styled, Button } from '@mui/material';
import type { IReleasePlanTemplate } from 'interfaces/releasePlans';

const StyledBoldSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

interface IReleasePlanAddChangeRequestDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
    template?: IReleasePlanTemplate;
    featureName: string;
    environment: string;
}

export const ReleasePlanAddChangeRequestDialog = ({
    open,
    setOpen,
    onConfirm,
    template,
    featureName,
    environment,
}: IReleasePlanAddChangeRequestDialogProps) => (
    <Dialogue
        title='Request changes'
        open={open}
        primaryButtonText='Add suggestion to draft'
        secondaryButtonText='Cancel'
        onClose={() => setOpen(false)}
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
            <StyledBoldSpan>{template?.name}</StyledBoldSpan> to{' '}
            <StyledBoldSpan>{featureName}</StyledBoldSpan> in{' '}
            <StyledBoldSpan>{environment}</StyledBoldSpan>
        </p>
    </Dialogue>
);
