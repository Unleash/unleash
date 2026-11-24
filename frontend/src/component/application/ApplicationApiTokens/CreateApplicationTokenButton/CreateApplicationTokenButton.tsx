import PermissionButton, {
    type IPermissionButtonProps,
} from 'component/common/PermissionButton/PermissionButton';
import { useApiTokenLimit } from 'hooks/api/getters/useApiTokenLimit/useApiTokenLimit';
import {
    ADMIN,
    CREATE_CLIENT_API_TOKEN,
    CREATE_FRONTEND_API_TOKEN,
} from '@server/types/permissions';

type ICreateApplicationTokenButtonProps = Pick<
    IPermissionButtonProps,
    'onClick' | 'variant' | 'startIcon' | 'children'
>;

// Opens the create token panel; whoever renders it owns the panel, so the
// panel outlives this button.
export const CreateApplicationTokenButton = ({
    onClick,
    variant,
    startIcon,
    children,
}: ICreateApplicationTokenButtonProps) => {
    const { limitReached, loading } = useApiTokenLimit();

    return (
        <PermissionButton
            permission={[
                ADMIN,
                CREATE_CLIENT_API_TOKEN,
                CREATE_FRONTEND_API_TOKEN,
            ]}
            onClick={onClick}
            variant={variant}
            startIcon={startIcon}
            disabled={loading || limitReached}
        >
            {children}
        </PermissionButton>
    );
};
