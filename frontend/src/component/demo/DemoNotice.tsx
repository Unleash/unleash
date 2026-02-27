import { Button, styled, Typography } from '@mui/material';
import { ReactComponent as StarsIcon } from 'assets/img/stars.svg';

const StyledNotice = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.web.main,
    color: theme.palette.web.contrastText,
    borderTopLeftRadius: theme.shape.borderRadiusLarge,
    borderTopRightRadius: theme.shape.borderRadiusLarge,
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '100%',
    maxWidth: theme.spacing(30),
    height: theme.spacing(6),
    zIndex: theme.zIndex.sticky,
    boxShadow: theme.boxShadows.popup,
    '&:hover': {
        backgroundColor: theme.palette.web.main,
        transition: 'filter ease-in-out 150ms',
        filter: 'brightness(1.1)',
    },
}));

const StyledStars = styled(StarsIcon)({
    position: 'absolute',
    left: 6,
    top: -24,
});

const StyledStarsRight = styled(StarsIcon)({
    position: 'absolute',
    right: 6,
    top: -24,
    transform: 'scaleX(-1)',
});

const StyledTitle = styled('div')({
    display: 'flex',
    alignItems: 'center',
});

interface IDemoNoticeProps {
    onClick?: () => void;
}

export const DemoNotice = ({ onClick }: IDemoNoticeProps) => {
    return (
        <StyledNotice onClick={onClick}>
            <StyledStars />
            <StyledTitle>
                <Typography fontWeight='bold'>Unleash demo</Typography>
            </StyledTitle>
            <StyledStarsRight />
        </StyledNotice>
    );
};
