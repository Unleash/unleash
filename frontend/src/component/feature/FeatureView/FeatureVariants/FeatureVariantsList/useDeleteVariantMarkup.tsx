import { Alert } from '@mui/material';
import { Dialogue } from 'component/common/Dialogue/Dialogue';

interface IUseDeleteVariantMarkupProps {
    show: boolean;
    onClick: () => void;
    onClose: () => void;
}

const useDeleteVariantMarkup = ({
    show,
    onClick,
    onClose,
}: IUseDeleteVariantMarkupProps) => {
    return (
        <Dialogue
            title="Are you sure you want to delete this variant?"
            open={show}
            primaryButtonText="Delete variant"
            secondaryButtonText="Cancel"
            onClick={onClick}
            onClose={onClose}
        >
            <Alert severity="error">
                Deleting this variant will change which variant users receive.
            </Alert>
        </Dialogue>
    );
};

export default useDeleteVariantMarkup;
