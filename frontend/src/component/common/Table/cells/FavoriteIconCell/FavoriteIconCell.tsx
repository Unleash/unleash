import type { VFC } from 'react';
import { Box, IconButton, styled } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledCell = styled(Box)(({ theme }) => ({
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(0.5),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.main,
    paddingRight: theme.spacing(0.5),
}));

const StyledIconButtonInactive = styled(StyledIconButton)({
    opacity: 0,
    '&:hover': {
        opacity: 1,
    },
    '&:focus': {
        opacity: 1,
    },
    '&:active': {
        opacity: 1,
    },
});

interface IFavoriteIconCellProps {
    value?: boolean;
    onClick?: () => void;
}

export const FavoriteIconCell: VFC<IFavoriteIconCellProps> = ({
    value,
    onClick,
}) => (
    <StyledCell>
        <ConditionallyRender
            condition={Boolean(value)}
            show={
                <StyledIconButton onClick={onClick} size='small'>
                    <StarIcon fontSize='small' />
                </StyledIconButton>
            }
            elseShow={
                <StyledIconButtonInactive
                    className='show-row-hover'
                    onClick={onClick}
                    size='small'
                >
                    <StarBorderIcon fontSize='small' />
                </StyledIconButtonInactive>
            }
        />
    </StyledCell>
);
