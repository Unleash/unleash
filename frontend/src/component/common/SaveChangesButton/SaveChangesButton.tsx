import PermissionButton from '../PermissionButton/PermissionButton';

interface ISaveChangesButtonProps {
    permission: string;
}

export const SaveChangesButton = ({
    permission,
    ...rest
}: ISaveChangesButtonProps) => {
    return (
        <PermissionButton permission={permission} type="submit" {...rest}>
            Save
        </PermissionButton>
    );
};
