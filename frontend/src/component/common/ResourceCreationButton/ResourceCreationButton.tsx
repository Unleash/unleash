import PermissionButton from '../PermissionButton/PermissionButton';

interface IResourceCreationButtonProps {
    ressourceName: string;
    permission: string;
}

export const ResourceCreationButton = ({
    ressourceName,
    permission,
    ...rest
}: IResourceCreationButtonProps) => {
    return (
        <PermissionButton permission={permission} type="submit" {...rest}>
            Create {ressourceName}
        </PermissionButton>
    );
};
