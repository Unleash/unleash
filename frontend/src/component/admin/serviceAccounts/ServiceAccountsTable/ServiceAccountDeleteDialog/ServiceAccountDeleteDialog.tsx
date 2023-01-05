import { Alert, styled } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { IUser } from 'interfaces/user';

const StyledLabel = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

interface IServiceAccountDeleteDialogProps {
    serviceAccount?: IUser;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (serviceAccount: IUser) => void;
}

export const ServiceAccountDeleteDialog = ({
    serviceAccount,
    open,
    setOpen,
    onConfirm,
}: IServiceAccountDeleteDialogProps) => {
    return (
        <Dialogue
            title="Delete service account?"
            open={open}
            primaryButtonText="Delete service account"
            secondaryButtonText="Cancel"
            onClick={() => onConfirm(serviceAccount!)}
            onClose={() => {
                setOpen(false);
            }}
        >
            <Alert severity="error">
                Deleting this service account may break any existing
                implementations currently using it.
            </Alert>
            <StyledLabel>
                You are about to delete service account:{' '}
                <strong>{serviceAccount?.name}</strong>
            </StyledLabel>
        </Dialogue>
    );
};
