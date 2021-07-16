import { ListItem, Link } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';

import { useStyles } from './NavigationLink.styles';

interface INavigationLinkProps {
    path: string;
    text: string;
    handleClose: () => void;
}

const NavigationLink = ({ path, text, handleClose }: INavigationLinkProps) => {
    const styles = useStyles();

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
            >
                <span className={styles.menuItemBox} />
                {text}
            </Link>
        </ListItem>
    );
};

export default NavigationLink;
