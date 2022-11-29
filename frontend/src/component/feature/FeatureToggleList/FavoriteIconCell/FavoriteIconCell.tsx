import { VFC } from 'react';
import { Box, IconButton } from '@mui/material';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IFavoriteIconCellProps {
    value?: boolean;
    onClick?: () => void;
}

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
                <IconButton
                    onClick={onClick}
                    size="small"
                    sx={{
                        color: 'transparent',
                        '&:hover, &:focus': {
                            color: theme => theme.palette.primary.main,
                        },
                    }}
                >
                    <StarBorderIcon fontSize="small" />
                </IconButton>
            }
        />
    </Box>
);
