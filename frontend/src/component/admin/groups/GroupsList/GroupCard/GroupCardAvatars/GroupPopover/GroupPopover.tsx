import { Popover, styled } from '@mui/material';
import { IGroupUser, Role } from 'interfaces/group';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Badge } from 'component/common/Badge/Badge';
import { StarRounded } from '@mui/icons-material';

const StyledPopover = styled(Popover)(({ theme }) => ({
    pointerEvents: 'none',
    '.MuiPaper-root': {
        padding: theme.spacing(2),
    },
}));

const StyledPopupStar = styled(StarRounded)(({ theme }) => ({
    color: theme.palette.warning.main,
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
                show={<Badge>{user?.role}</Badge>}
                elseShow={
                    <Badge color="success" icon={<StyledPopupStar />}>
                        {user?.role}
                    </Badge>
                }
            />

            <StyledName>{user?.name || user?.username}</StyledName>
            <div>{user?.email}</div>
        </StyledPopover>
    );
};
