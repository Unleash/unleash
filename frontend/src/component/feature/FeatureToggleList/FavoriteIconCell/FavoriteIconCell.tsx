import { VFC } from 'react';
import { Box, IconButton } from '@mui/material';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

interface IFavoriteIconCellProps {
    value?: boolean;
}

export const FavoriteIconCell: VFC<IFavoriteIconCellProps> = ({
    value = false,
}) => (
    <Box sx={{ pl: 1.25 }}>
        <ConditionallyRender
            condition={value}
            show={
                <IconButton color="primary" size="small">
                    <StarIcon fontSize="small" />
                </IconButton>
            }
            elseShow={
                <IconButton
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
