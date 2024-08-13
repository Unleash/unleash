import { Dialogue } from 'component/common/Dialogue/Dialogue';

type ReviveProjectDialogProps = {
    name?: string;
    id?: string;
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
};

export const ReviveProjectDialog = ({
    name,
    id,
    open,
    onClose,
    onSubmit,
}: ReviveProjectDialogProps) => (
    <Dialogue
        open={open}
        secondaryButtonText='Close'
        onClose={onClose}
        onClick={onSubmit}
        title='Restore archived project'
    >
        Are you sure you'd like to restore project <strong>{name}</strong> (id:{' '}
        <code>{id}</code>)?
        {/* TODO: more explanation */}
    </Dialogue>
);
