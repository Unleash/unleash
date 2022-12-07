import { VFC } from 'react';
import { Box, IconButton, styled, Tooltip } from '@mui/material';
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
                <Tooltip title={'Remove from favorites'}>
                    <IconButton
                        onClick={onClick}
                        color="primary"
                        size="small"
                        sx={{ padding: 1.25 }}
                    >
                        <StarIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            }
            elseShow={
                <Tooltip title={'Add to favorites'}>
                    <InactiveIconButton
                        onClick={onClick}
                        size="small"
                        sx={{ padding: 1.25 }}
                    >
                        <StarBorderIcon fontSize="small" />
                    </InactiveIconButton>
                </Tooltip>
            }
        />
    </Box>
);
