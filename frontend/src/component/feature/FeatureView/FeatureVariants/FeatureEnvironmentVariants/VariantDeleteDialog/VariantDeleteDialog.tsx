import { Alert } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';

interface IUseDeleteVariantMarkupProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
}

const useDeleteVariantMarkup = ({
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
        </Dialogue>
    );
};

export default useDeleteVariantMarkup;
