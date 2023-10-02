import { Alert, styled } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { IServiceAccount } from 'interfaces/service-account';
import { ServiceAccountTokens } from '../ServiceAccountModal/ServiceAccountTokens/ServiceAccountTokens';

const StyledTableContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(1.5),
}));

const StyledLabel = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

interface IServiceAccountDeleteDialogProps {
    serviceAccount?: IServiceAccount;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (serviceAccount: IServiceAccount) => void;
}

export const ServiceAccountDeleteDialog = ({
    serviceAccount,
    open,
    setOpen,
    onConfirm,
}: IServiceAccountDeleteDialogProps) => {
    const deleteMessage = (
        <>
            You are about to delete service account:{' '}
            <strong>{serviceAccount?.name}</strong>
        </>
    );

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
            <ConditionallyRender
                condition={Boolean(serviceAccount?.tokens.length)}
                show={
                    <>
                        <Alert severity="error">
                            Deleting this service account may break any existing
                            implementations currently using it.
                        </Alert>
                        <StyledLabel>{deleteMessage}</StyledLabel>
                        <StyledLabel>Service account tokens:</StyledLabel>
                        <StyledTableContainer>
                            <ServiceAccountTokens
                                serviceAccount={serviceAccount!}
                                readOnly
                            />
                        </StyledTableContainer>
                    </>
                }
                elseShow={<p>{deleteMessage}</p>}
            />
        </Dialogue>
    );
};
