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
import type { IRole } from 'interfaces/role';
import type { IGroup } from 'interfaces/group';

export type IAccessOverviewPermissionCategory = Omit<
    IPermissionCategory,
    'permissions'
> & {
    permissions: IAccessOverviewPermission[];
};

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
    margin: 0,
}));

const StyledRoleSource = styled('span')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    paddingLeft: theme.spacing(3),
}));

const StyledRoleItem = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
    padding: theme.spacing(0.5, 0),
}));

const StyledRoleDescriptions = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
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

export const AccessOverviewList = ({
    categories,
    rootRole,
    roles,
    groups,
}: {
    categories: IAccessOverviewPermissionCategory[];
    rootRole: IRole | undefined;
    roles: number[] | undefined;
    groups: IGroup[] | undefined;
}) => {
    const { searchQuery } = useSearchHighlightContext();

    const list = (
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
                                    rootRole={rootRole}
                                    roles={roles}
                                    groups={groups}
                                />
                            </li>
                        ))}
                    </StyledList>
                </>
            ))}
        </StyledList>
    );

    return <Box sx={{ maxHeight: 500, overflow: 'auto' }}>{list}</Box>;
};

const RoleDescription = ({
    roleId,
    permission,
    sourceLabel,
}: {
    roleId: number;
    permission: string;
    sourceLabel: string;
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
        <StyledRoleItem>
            <StyledRoleHeader>
                <StyledSupervisedUserCircle color='disabled' />
                {name}
            </StyledRoleHeader>
            <StyledRoleSource>{sourceLabel}</StyledRoleSource>
        </StyledRoleItem>
    );
};

const PermissionStatus = ({
    hasPermission,
    permission,
    rootRole,
    roles,
    groups,
}: {
    hasPermission: boolean;
    permission: string;
    rootRole: IRole | undefined;
    roles: number[] | undefined;
    groups: IGroup[] | undefined;
}) => (
    <>
        {hasPermission && (
            <TooltipLink
                tooltip={
                    <StyledRoleDescriptions>
                        <StyledInfo>Due to these roles and groups</StyledInfo>
                        {rootRole && (
                            <RoleDescription
                                key={rootRole?.id}
                                permission={permission}
                                roleId={rootRole?.id}
                                sourceLabel='Via instance role'
                            />
                        )}
                        {roles?.map((roleId) => (
                            <RoleDescription
                                key={roleId}
                                permission={permission}
                                roleId={roleId}
                                sourceLabel='Directly assigned to user on the project'
                            />
                        ))}
                        {groups
                            ?.filter((group) => group.rootRole)
                            .map((group) => (
                                <RoleDescription
                                    key={group.id}
                                    permission={permission}
                                    roleId={group.rootRole!}
                                    sourceLabel={`As a member of group "${group.name}"`}
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
