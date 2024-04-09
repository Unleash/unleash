import { Alert, styled } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

interface IScimTokenGenerationDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
}

export const ScimTokenGenerationDialog = ({
    open,
    setOpen,
    onConfirm,
}: IScimTokenGenerationDialogProps) => (
    <Dialogue
        open={open}
        secondaryButtonText='Close'
        onClose={(_, muiCloseReason?: string) => {
            if (!muiCloseReason) {
                setOpen(false);
            }
        }}
        primaryButtonText='Generate new token'
        onClick={onConfirm}
        title='Generate new SCIM API token?'
    >
        <StyledAlert severity='error'>
            Generating a new token will <strong>immediately revoke</strong> the
            current one, which may break any existing provision integrations
            currently using it.
        </StyledAlert>
    </Dialogue>
);
