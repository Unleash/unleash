import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { Link, useLocation } from 'react-router-dom';
import ConditionallyRender from '../ConditionallyRender';
import { useStyles } from './BreadcrumbNav.styles';

const BreadcrumbNav = () => {
    const styles = useStyles();
    const location = useLocation();

    const paths = location.pathname
        .split('/')
        .filter(item => item)
        .filter(
            item =>
                item !== 'create' &&
                item !== 'edit' &&
                item !== 'access' &&
                item !== 'view' &&
                item !== 'variants' &&
                item !== 'logs' &&
                item !== 'metrics' &&
                item !== 'copy'
        );

    return (
        <ConditionallyRender
            condition={paths.length > 1}
            show={
                <Breadcrumbs className={styles.breadcrumbNav}>
                    {paths.map((path, index) => {
                        const lastItem = index === paths.length - 1;
                        if (lastItem) {
                            return (
                                <p className={styles.breadcrumbNavParagraph}>
                                    {path}
                                </p>
                            );
                        }
                        return (
                            <Link
                                className={styles.breadcrumbLink}
                                to={`/${path}`}
                            >
                                {path}
                            </Link>
                        );
                    })}
                </Breadcrumbs>
            }
        />
    );
};

export default BreadcrumbNav;
