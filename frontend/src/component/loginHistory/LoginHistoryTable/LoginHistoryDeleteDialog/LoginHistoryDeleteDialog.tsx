import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { ILoginEvent } from 'interfaces/loginEvent';

interface ILoginHistoryDeleteDialogProps {
    event?: ILoginEvent;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (event: ILoginEvent) => void;
}

export const LoginHistoryDeleteDialog = ({
    event,
    open,
    setOpen,
    onConfirm,
}: ILoginHistoryDeleteDialogProps) => (
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
