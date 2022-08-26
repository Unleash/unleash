import { Link, Popover, styled } from '@mui/material';
import { TextCell } from 'component/common/Table/cells/TextCell/TextCell';
import React from 'react';
import { VFC } from 'react';
import { ProjectRoleDescription } from 'component/project/ProjectAccess/ProjectAccessAssign/ProjectRoleDescription/ProjectRoleDescription';

const StyledLink = styled(Link)(() => ({
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

const StyledPopover = styled(Popover)(() => ({
    pointerEvents: 'none',
}));

interface IProjectAccessRoleCellProps {
    roleId: number;
    value?: string;
    emptyText?: string;
}

export const ProjectAccessRoleCell: VFC<IProjectAccessRoleCellProps> = ({
    roleId,
    value,
    emptyText,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const onPopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const onPopoverClose = () => {
        setAnchorEl(null);
    };

    if (!value) return <TextCell>{emptyText}</TextCell>;

    return (
        <>
            <TextCell>
                <StyledLink
                    onMouseEnter={event => {
                        onPopoverOpen(event);
                    }}
                    onMouseLeave={onPopoverClose}
                >
                    {value}
                </StyledLink>
            </TextCell>
            <StyledPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={onPopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <ProjectRoleDescription roleId={roleId} popover />
            </StyledPopover>
        </>
    );
};
