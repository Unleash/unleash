import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import { Box, styled } from '@mui/material';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
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
}: {
    categories: IAccessOverviewPermissionCategory[];
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
