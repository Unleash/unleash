import PermissionButton, {
    IPermissionButtonProps,
} from '../PermissionButton/PermissionButton';

interface IUpdateButtonProps extends IPermissionButtonProps {}

export const UpdateButton = ({ permission, ...rest }: IUpdateButtonProps) => {
    return (
        <PermissionButton permission={permission} type="submit" {...rest}>
            Save
        </PermissionButton>
    );
};
