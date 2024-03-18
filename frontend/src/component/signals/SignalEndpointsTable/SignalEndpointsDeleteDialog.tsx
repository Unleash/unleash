import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { ISignalEndpoint } from 'interfaces/signal';

interface ISignalEndpointsDeleteDialogProps {
    signalEndpoint?: ISignalEndpoint;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (signalEndpoint: ISignalEndpoint) => void;
}

export const SignalEndpointsDeleteDialog = ({
    signalEndpoint,
    open,
    setOpen,
    onConfirm,
}: ISignalEndpointsDeleteDialogProps) => (
    <Dialogue
        title='Delete signal endpoint?'
        open={open}
        primaryButtonText='Delete signal endpoint'
        secondaryButtonText='Cancel'
        onClick={() => onConfirm(signalEndpoint!)}
        onClose={() => {
            setOpen(false);
        }}
    >
        <p>
            You are about to delete signal endpoint:{' '}
            <strong>{signalEndpoint?.name}</strong>
        </p>
    </Dialogue>
);
