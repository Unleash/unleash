import { Dialogue } from 'component/common/Dialogue/Dialogue';

interface ILoginHistoryDeleteAllDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
}

export const LoginHistoryDeleteAllDialog = ({
    open,
    setOpen,
    onConfirm,
}: ILoginHistoryDeleteAllDialogProps) => (
    <Dialogue
        title="Clear login history?"
        open={open}
        primaryButtonText="Clear login history"
        secondaryButtonText="Cancel"
        onClick={onConfirm}
        onClose={() => {
            setOpen(false);
        }}
    >
        You are about to clear the login history.
        <br />
        This will delete all the login events.
    </Dialogue>
);
