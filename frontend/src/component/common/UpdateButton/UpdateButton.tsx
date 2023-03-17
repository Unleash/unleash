import PermissionButton, {
    IPermissionButtonProps,
} from 'component/common/PermissionButton/PermissionButton';

export const UpdateButton = ({ ...rest }: IPermissionButtonProps) => {
    return (
        <PermissionButton type="submit" {...rest}>
            Save
        </PermissionButton>
    );
};
