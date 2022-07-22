import { Popover, Badge, styled, Tooltip } from '@mui/material';
import { IGroup, IGroupUser, Role } from 'interfaces/group';
import { Link } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

import { Badge as StyledBadge } from 'component/common/Badge/Badge';

import { RemoveGroup } from 'component/admin/groups/RemoveGroup/RemoveGroup';
import { useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import { IUser } from '../../../../../../../interfaces/user';

const StyledPopover = styled(Popover)(({ theme }) => ({
    pointerEvents: 'none',
    '.MuiPaper-root': {
        padding: '12px',
    },
}));

const StyledPopupStar = styled(StarIcon)(({ theme }) => ({
    color: theme.palette.warning.main,
    fontSize: theme.fontSizes.smallBody,
    marginLeft: theme.spacing(0.1),
    marginTop: theme.spacing(2),
}));

const StyledName = styled('div')(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    marginTop: theme.spacing(1),
}));

interface IGroupPopoverProps {
    user: IGroupUser | undefined;

    open: boolean;
    anchorEl: HTMLElement | null;

    onPopoverClose(event: React.MouseEvent<HTMLElement>): void;
}

export const GroupPopover = ({
    user,
    open,
    anchorEl,
    onPopoverClose,
}: IGroupPopoverProps) => {
    return (
        <StyledPopover
            open={open}
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
            <ConditionallyRender
                condition={user?.role === Role.Member}
                show={<StyledBadge color="success">{user?.role}</StyledBadge>}
                elseShow={
                    <Badge
                        overlap="circular"
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        badgeContent={<StyledPopupStar />}
                    >
                        <StyledBadge
                            color="success"
                            sx={{ paddingLeft: '16px' }}
                        >
                            {user?.role}
                        </StyledBadge>
                    </Badge>
                }
            />

            <StyledName>{user?.name}</StyledName>
            <div>{user?.email}</div>
        </StyledPopover>
    );
};
