import { VFC } from 'react';
import { Box, IconButton, styled } from '@mui/material';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IFavoriteIconCellProps {
    value?: boolean;
    onClick?: () => void;
}

const InactiveIconButton = styled(IconButton)(({ theme }) => ({
    color: 'transparent',
    '&:hover, &:focus': {
        color: theme.palette.primary.main,
    },
}));

export const FavoriteIconCell: VFC<IFavoriteIconCellProps> = ({
    value = false,
    onClick,
}) => (
    <Box sx={{ pl: 1.25 }}>
        <ConditionallyRender
            condition={value}
            show={
                <IconButton onClick={onClick} color="primary" size="small">
                    <StarIcon fontSize="small" />
                </IconButton>
            }
            elseShow={
                <InactiveIconButton onClick={onClick} size="small">
                    <StarBorderIcon fontSize="small" />
                </InactiveIconButton>
            }
        />
    </Box>
);
