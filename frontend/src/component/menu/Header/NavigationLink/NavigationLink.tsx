import { ListItem, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { useStyles } from './NavigationLink.styles';

interface INavigationLinkProps {
    path: string;
    text: string;
    handleClose: () => void;
}

const NavigationLink = ({ path, text, handleClose }: INavigationLinkProps) => {
    const { classes: styles } = useStyles();

    return (
        <ListItem
            className={styles.menuItem}
            onClick={() => {
                handleClose();
            }}
        >
            <Link
                style={{ textDecoration: 'none' }}
                component={RouterLink}
                className={styles.navMenuLink}
                to={path}
                underline="hover"
            >
                <span className={styles.menuItemBox} />
                {text}
            </Link>
        </ListItem>
    );
};

export default NavigationLink;
