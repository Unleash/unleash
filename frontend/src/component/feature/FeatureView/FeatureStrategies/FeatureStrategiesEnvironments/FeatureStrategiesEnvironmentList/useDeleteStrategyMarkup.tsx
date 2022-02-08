import { Alert } from '@material-ui/lab';
import Dialogue from '../../../../../common/Dialogue';

interface IUseDeleteStrategyMarkupProps {
    show: boolean;
    onClick: () => void;
    onClose: () => void;
}

const useDeleteStrategyMarkup = ({
    show,
    onClick,
    onClose,
}: IUseDeleteStrategyMarkupProps) => {
    return (
        <Dialogue
            title="Are you sure you want to delete this strategy?"
            open={show}
            primaryButtonText="Delete strategy"
            secondaryButtonText="Cancel"
            onClick={onClick}
            onClose={onClose}
        >
            <Alert severity="error">
                Deleting the strategy will change which users receive access to
                the feature.
            </Alert>
        </Dialogue>
    );
};

export default useDeleteStrategyMarkup;
