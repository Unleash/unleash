import PermissionButton, {
    IPermissionButtonProps,
} from '../PermissionButton/PermissionButton';

interface ICreateButtonProps extends IPermissionButtonProps {
    name: string;
}

export const CreateButton = ({ name, ...rest }: ICreateButtonProps) => {
    return (
        <PermissionButton type="submit" {...rest}>
            Create {name}
        </PermissionButton>
    );
};
