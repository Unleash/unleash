import { ListItem, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/system';

import { useStyles } from './NavigationLink.styles';

interface INavigationLinkProps {
    path: string;
    text: string;
    handleClose: () => void;
}

const StyledListItem = styled(ListItem)({
    minWidth: '150px',
    height: '100%',
    width: '100%',
    margin: '0',
    padding: '0',
});

const StyledLink = styled(RouterLink)(({ theme }) => ({
    textDecoration: 'none',
    alignItems: 'center',
    display: 'flex',
    color: 'inherit',
    height: '100%',
    width: '100%',
    '&&': {
        // Override MenuItem's built-in padding.
        padding: '0.5rem 1rem',
    },
}));

const StyledSpan = styled('span')(({ theme }) => ({
    width: '12.5px',
    height: '12.5px',
    display: 'block',
    backgroundColor: theme.palette.primary.main,
    marginRight: '1rem',
    borderRadius: '2px',
}));

const NavigationLink = ({ path, text, handleClose }: INavigationLinkProps) => {
    const { classes: styles } = useStyles();

    return (
        <StyledListItem
            onClick={() => {
                handleClose();
            }}
        >
            <Link
                style={{ textDecoration: 'none' }}
                component={StyledLink}
                className={styles.navMenuLink}
                to={path}
                underline="hover"
            >
                <StyledSpan />
                {text}
            </Link>
        </StyledListItem>
    );
};

export default NavigationLink;
