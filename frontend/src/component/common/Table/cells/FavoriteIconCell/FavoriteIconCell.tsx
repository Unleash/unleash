import { VFC } from 'react';
import { Box, IconButton, styled } from '@mui/material';
import {
    Star as StarIcon,
    StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledCell = styled(Box)(({ theme }) => ({
    paddingLeft: theme.spacing(1.25),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.primary.main,
    padding: theme.spacing(1.25),
}));

const StyledIconButtonInactive = styled(StyledIconButton)({
    opacity: 0,
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
                <StyledIconButton onClick={onClick} size="small">
                    <StarIcon fontSize="small" />
                </StyledIconButton>
            }
            elseShow={
                <StyledIconButtonInactive
                    className="show-row-hover"
                    onClick={onClick}
                    size="small"
                >
                    <StarBorderIcon fontSize="small" />
                </StyledIconButtonInactive>
            }
        />
    </StyledCell>
);
