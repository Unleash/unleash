import { Dialogue } from 'component/common/Dialogue/Dialogue';

interface IServiceAccountDeleteAllDialogProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: () => void;
}

export const SignOnLogDeleteAllDialog = ({
    open,
    setOpen,
    onConfirm,
}: IServiceAccountDeleteAllDialogProps) => (
    <Dialogue
        title="Clear sign-on log?"
        open={open}
        primaryButtonText="Clear sign-on log"
        secondaryButtonText="Cancel"
        onClick={onConfirm}
        onClose={() => {
            setOpen(false);
        }}
    >
        You are about to clear the sign-on log.
        <br />
        This will delete all the sign-on events.
    </Dialogue>
);
