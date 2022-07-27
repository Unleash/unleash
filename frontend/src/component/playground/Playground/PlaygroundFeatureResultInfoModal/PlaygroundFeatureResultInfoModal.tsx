import { PlaygroundFeatureSchema } from '../../../../hooks/api/actions/usePlayground/playground.model';
import { Modal } from '@mui/material';

interface PlaygroundFeatureResultInfoModalProps {
    feature?: PlaygroundFeatureSchema;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export const PlaygroundFeatureResultInfoModal = ({
    feature,
    open,
    setOpen,
}: PlaygroundFeatureResultInfoModalProps) => {
    if (!feature) {
        return null;
    }

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <p>Test</p>
        </Modal>
    );
};
