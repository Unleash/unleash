import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import { Box, styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { useRole } from 'hooks/api/getters/useRole/useRole';
import SupervisedUserCircle from '@mui/icons-material/SupervisedUserCircle';
import type {
    IAccessOverviewPermission,
    IPermissionCategory,
} from 'interfaces/permissions';

export type IAccessOverviewPermissionCategory = Omit<
    IPermissionCategory,
    'permissions'
> & {
    permissions: IAccessOverviewPermission[];
};

const StyledDescription = styled('div', {
    shouldForwardProp: (prop) => prop !== 'tooltip',
})<{ tooltip?: boolean }>(({ theme, tooltip }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    padding: tooltip ? theme.spacing(1) : theme.spacing(3),
    backgroundColor: tooltip
        ? theme.palette.background.paper
        : theme.palette.neutral.light,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    borderRadius: tooltip ? 0 : theme.shape.borderRadiusMedium,
}));

const StyledSupervisedUserCircle = styled(SupervisedUserCircle)(
    ({ theme }) => ({
        fontSize: theme.fontSizes.mainHeader,
    }),
);

const StyledRoleHeader = styled('p')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.bodySize,
    fontWeight: theme.fontWeight.bold,
}));

const StyledRoleDescriptions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    '& > *:not(:last-child)': {
        borderBottom: `1px solid ${theme.palette.divider}`,
        paddingBottom: theme.spacing(1),
    },
}));
const StyledInfo = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: theme.fontSizes.smallBody,
    '& > li': {
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
    '& ul li': {
        paddingLeft: theme.spacing(4),
    },
    '& ul:last-of-type > li:last-child': {
        borderBottom: 'none',
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

export const NewAccessOverviewList = ({
    categories,
    roles,
}: {
    categories: IAccessOverviewPermissionCategory[];
    roles: number[] | undefined;
}) => {
    const { searchQuery } = useSearchHighlightContext();

    return (
        <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
            <StyledList>
                {categories.map((category) => (
                    <>
                        <li key={category.label}>
                            <strong>{category.label}</strong>
                        </li>
                        <StyledList>
                            {category.permissions.map((permission) => (
                                <li key={permission.name}>
                                    <div>
                                        <Highlighter search={searchQuery}>
                                            {permission.displayName}
                                        </Highlighter>
                                    </div>
                                    <PermissionStatus
                                        hasPermission={permission.hasPermission}
                                        permission={permission.name}
                                        roles={roles}
                                    />
                                </li>
                            ))}
                        </StyledList>
                    </>
                ))}
            </StyledList>
        </Box>
    );
};

const RoleDescription = ({
    roleId,
    permission,
}: {
    roleId: number;
    permission: string;
}) => {
    const { role } = useRole(roleId.toString());
    if (!role) return null;
    const { name, permissions } = role;
    if (
        !permissions.some(
            (p) => p.name === permission || p.displayName === 'Admin',
        )
    )
        return null;

    return (
        <StyledDescription>
            <StyledRoleHeader>
                <StyledSupervisedUserCircle color='disabled' />
                {name}
            </StyledRoleHeader>
        </StyledDescription>
    );
};

const PermissionStatus = ({
    hasPermission,
    permission,
    roles,
}: {
    hasPermission: boolean;
    permission: string;
    roles: number[] | undefined;
}) => (
    <>
        {hasPermission && (
            <TooltipLink
                tooltip={
                    <StyledRoleDescriptions>
                        <StyledInfo>Due to these roles and groups</StyledInfo>
                        {roles?.map((roleId) => (
                            <RoleDescription
                                key={roleId}
                                permission={permission}
                                roleId={roleId}
                            />
                        ))}
                    </StyledRoleDescriptions>
                }
            >
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
            </TooltipLink>
        )}
        {!hasPermission && (
            <StyledPermissionStatus hasPermission={hasPermission}>
                <>
                    <Close />
                    No permission
                </>
            </StyledPermissionStatus>
        )}
    </>
);
