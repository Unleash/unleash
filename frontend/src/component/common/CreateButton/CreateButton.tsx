import PermissionButton, {
    IPermissionButtonProps,
} from '../PermissionButton/PermissionButton';

interface ICreateButtonProps extends IPermissionButtonProps {
    name: string;
}

export const CreateButton = ({
    name,
    permission,
    ...rest
}: ICreateButtonProps) => {
    return (
        <PermissionButton permission={permission} type="submit" {...rest}>
            Create {name}
        </PermissionButton>
    );
};
