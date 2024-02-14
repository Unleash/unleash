import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { IIncomingWebhook } from 'interfaces/incomingWebhook';

interface IIncomingWebhooksDeleteDialogProps {
    incomingWebhook?: IIncomingWebhook;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (incomingWebhook: IIncomingWebhook) => void;
}

export const IncomingWebhooksDeleteDialog = ({
    incomingWebhook,
    open,
    setOpen,
    onConfirm,
}: IIncomingWebhooksDeleteDialogProps) => (
    <Dialogue
        title='Delete incoming webhook?'
        open={open}
        primaryButtonText='Delete incoming webhook'
        secondaryButtonText='Cancel'
        onClick={() => onConfirm(incomingWebhook!)}
        onClose={() => {
            setOpen(false);
        }}
    >
        <p>
            You are about to delete incoming webhook:{' '}
            <strong>{incomingWebhook?.name}</strong>
        </p>
    </Dialogue>
);
