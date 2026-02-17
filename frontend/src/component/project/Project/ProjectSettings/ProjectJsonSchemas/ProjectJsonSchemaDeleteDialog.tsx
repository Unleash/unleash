import { Dialogue } from 'component/common/Dialogue/Dialogue';
import type { IProjectJsonSchema } from 'interfaces/jsonSchema';

interface IProjectJsonSchemaDeleteDialogProps {
    schema?: IProjectJsonSchema;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onConfirm: (schema: IProjectJsonSchema) => void;
}

export const ProjectJsonSchemaDeleteDialog = ({
    schema,
    open,
    setOpen,
    onConfirm,
}: IProjectJsonSchemaDeleteDialogProps) => (
    <Dialogue
        title='Delete JSON schema?'
        open={open}
        primaryButtonText='Delete schema'
        secondaryButtonText='Cancel'
        onClick={() => onConfirm(schema!)}
        onClose={() => {
            setOpen(false);
        }}
    >
        <p>
            You are about to delete JSON schema: <strong>{schema?.name}</strong>
        </p>
        <p>
            Any strategy variants referencing this schema will no longer be
            validated against it.
        </p>
    </Dialogue>
);
