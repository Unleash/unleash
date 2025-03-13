import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import { Box, styled } from '@mui/material';
import type { IAccessOverviewPermission } from 'interfaces/permissions';

const StyledList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: theme.fontSizes.smallBody,
    '& li': {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(2),
        '&:not(:last-child)': {
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
    },
}));

const StyledPermissionStatus = styled('div', {
    shouldForwardProp: (prop) => prop !== 'hasPermission',
})<{ hasPermission: boolean }>(({ theme, hasPermission }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    width: theme.spacing(17.5),
    color: hasPermission
        ? theme.palette.text.primary
        : theme.palette.text.secondary,
    '& > svg': {
        color: hasPermission
            ? theme.palette.success.main
            : theme.palette.error.main,
    },
}));

export const AccessOverviewList = ({
    permissions,
}: {
    permissions: IAccessOverviewPermission[];
}) => {
    return (
        <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
            <StyledList>
                {permissions.map((permission) => (
                    <li key={permission.name}>
                        <div>{permission.displayName}</div>
                        <PermissionStatus
                            hasPermission={permission.hasPermission}
                        />
                    </li>
                ))}
            </StyledList>
        </Box>
    );
};

const PermissionStatus = ({ hasPermission }: { hasPermission: boolean }) => (
    <StyledPermissionStatus hasPermission={hasPermission}>
        {hasPermission ? (
            <>
                <Check />
                Has permission
            </>
        ) : (
            <>
                <Close />
                No permission
            </>
        )}
    </StyledPermissionStatus>
);
