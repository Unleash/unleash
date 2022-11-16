import { Alert, styled } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { IFeatureVariant } from 'interfaces/featureToggle';

const StyledLabel = styled('p')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

interface IUseDeleteVariantMarkupProps {
    variant: IFeatureVariant;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
}

const useDeleteVariantMarkup = ({
    variant,
    open,
    setOpen,
    onConfirm,
}: IUseDeleteVariantMarkupProps) => {
    return (
        <Dialogue
            title="Delete variant?"
            open={open}
            primaryButtonText="Delete variant"
            secondaryButtonText="Close"
            onClick={onConfirm}
            onClose={() => {
                setOpen(false);
            }}
        >
            <Alert severity="error">
                Deleting this variant will change which variant users receive.
            </Alert>
            <StyledLabel>
                You are about to delete variant: <strong>{variant.name}</strong>
            </StyledLabel>
        </Dialogue>
    );
};

export default useDeleteVariantMarkup;
