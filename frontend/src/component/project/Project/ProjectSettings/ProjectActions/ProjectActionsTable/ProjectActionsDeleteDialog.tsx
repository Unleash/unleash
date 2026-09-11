import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { IActionSet } from 'interfaces/action';
import {
    projectActionSizeProps,
    projectActionDeletedTracking,
} from '../projectActionsTracking.ts';

interface IProjectActionsDeleteDialogProps {
    action?: IActionSet;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (action: IActionSet) => Promise<unknown>;
    onError: (error: unknown) => void;
}

export const ProjectActionsDeleteDialog = ({
    action,
    open,
    setOpen,
    onConfirm,
    onError,
}: IProjectActionsDeleteDialogProps) => (
    <Dialogue
        title='Delete action?'
        open={open}
        primaryButtonText='Delete action'
        secondaryButtonText='Cancel'
        tracking={{
            ...projectActionDeletedTracking,
            props: projectActionSizeProps(action),
        }}
        onSubmit={() => onConfirm(action!)}
        onError={onError}
        onClose={() => {
            setOpen(false);
        }}
    >
        <p>
            You are about to delete action: <strong>{action?.name}</strong>
        </p>
    </Dialogue>
);
