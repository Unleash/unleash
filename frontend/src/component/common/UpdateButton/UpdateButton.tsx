import PermissionButton, {
    IPermissionButtonProps,
} from '../PermissionButton/PermissionButton';

export const UpdateButton = ({ ...rest }: IPermissionButtonProps) => {
    return (
        <PermissionButton type="submit" {...rest}>
            Save
        </PermissionButton>
    );
};
