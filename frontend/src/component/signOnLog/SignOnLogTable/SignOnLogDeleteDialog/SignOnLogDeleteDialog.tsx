import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ISignOnEvent } from 'interfaces/signOnEvent';

interface IServiceAccountDeleteDialogProps {
    event?: ISignOnEvent;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (event: ISignOnEvent) => void;
}

export const SignOnLogDeleteDialog = ({
    event,
    open,
    setOpen,
    onConfirm,
}: IServiceAccountDeleteDialogProps) => (
    <Dialogue
        title="Delete event?"
        open={open}
        primaryButtonText="Delete event"
        secondaryButtonText="Cancel"
        onClick={() => onConfirm(event!)}
        onClose={() => {
            setOpen(false);
        }}
    >
        You are about to delete event: <strong>#{event?.id}</strong>
    </Dialogue>
);
