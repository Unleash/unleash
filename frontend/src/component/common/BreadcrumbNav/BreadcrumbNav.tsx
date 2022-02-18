import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import { Link, useLocation } from 'react-router-dom';
import ConditionallyRender from '../ConditionallyRender';
import { useStyles } from './BreadcrumbNav.styles';
import AccessContext from '../../../contexts/AccessContext';
import { useContext } from 'react';
import StringTruncator from '../StringTruncator/StringTruncator';

const BreadcrumbNav = () => {
    const { isAdmin } = useContext(AccessContext);
    const styles = useStyles();
    const location = useLocation();

    const paths = location.pathname
        .split('/')
        .filter(item => item)
        .filter(
            item =>
                item !== 'create' &&
                item !== 'edit' &&
                item !== 'view' &&
                item !== 'variants' &&
                item !== 'logs' &&
                item !== 'metrics' &&
                item !== 'copy' &&
                item !== 'strategies' &&
                item !== 'features' &&
                item !== 'features2' &&
                item !== 'create-toggle' &&
                item !== 'settings'
        );

    return (
        <ConditionallyRender
            condition={
                (location.pathname.includes('admin') && isAdmin) ||
                !location.pathname.includes('admin')
            }
            show={
                <ConditionallyRender
                    condition={paths.length > 1}
                    show={
                        <Breadcrumbs className={styles.breadcrumbNav}>
                            {paths.map((path, index) => {
                                const lastItem = index === paths.length - 1;
                                if (lastItem) {
                                    return (
                                        <p
                                            key={path}
                                            className={
                                                styles.breadcrumbNavParagraph
                                            }
                                        >
                                            <StringTruncator
                                                text={path}
                                                maxWidth="200"
                                            />
                                        </p>
                                    );
                                }

                                let link = '/';

                                paths.forEach((path, i) => {
                                    if (i !== index && i < index) {
                                        link += path + '/';
                                    } else if (i === index) {
                                        link += path;
                                    }
                                });

                                return (
                                    <Link
                                        key={path}
                                        className={styles.breadcrumbLink}
                                        to={link}
                                    >
                                        <StringTruncator
                                            text={path}
                                            maxWidth="200"
                                        />
                                    </Link>
                                );
                            })}
                        </Breadcrumbs>
                    }
                />
            }
        />
    );
};

export default BreadcrumbNav;
