import PermissionButton, {
    type IPermissionButtonProps,
} from 'component/common/PermissionButton/PermissionButton';

export const UpdateButton = ({
    children = 'Save',
    ...rest
}: IPermissionButtonProps) => {
    return (
        <PermissionButton type='submit' {...rest}>
            {children}
        </PermissionButton>
    );
};
