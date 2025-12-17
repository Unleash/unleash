import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link, useLocation } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { useContext } from 'react';
import { styled } from '@mui/material';
import { textTruncated } from 'themes/themeStyles';

const StyledBreadcrumbContainer = styled('div')(({ theme }) => ({
    height: theme.spacing(2.5),
    margin: theme.spacing(2, 0),
}));

const StyledBreadcrumbs = styled(Breadcrumbs)({
    '& > ol': {
        flexWrap: 'nowrap',
        '& > li:last-child': {
            minWidth: 0,
        },
    },
});

const StyledCurrentPage = styled('span')(({ theme }) => ({
    ...textTruncated,
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledLink = styled(Link)(({ theme }) => ({
    '& > *': {
        maxWidth: theme.spacing(25),
    },
}));

const BreadcrumbNav = () => {
    const { isAdmin } = useContext(AccessContext);
    const location = useLocation();

    let paths = location.pathname
        .split('/')
        .filter((item) => item)
        .filter(
            (item) =>
                item !== 'create' &&
                item !== 'edit' &&
                item !== 'view' &&
                item !== 'variants' &&
                item !== 'logs' &&
                item !== 'metrics' &&
                item !== 'copy' &&
                item !== 'features' &&
                item !== 'features2' &&
                item !== 'settings' &&
                item !== 'profile' &&
                item !== 'insights',
        )
        .map(decodeURI);

    if (location.pathname === '/insights') {
        // Because of sticky header in Insights
        return null;
    }

    if (location.pathname === '/impact-metrics') {
        return null;
    }

    if (paths.length === 1 && paths[0] === 'projects-archive') {
        // It's not possible to use `projects/archive`, because it's :projectId path
        paths = ['projects', 'archive'];
    }

    return (
        <StyledBreadcrumbContainer>
            <ConditionallyRender
                condition={
                    (location.pathname.includes('admin') && isAdmin) ||
                    !location.pathname.includes('admin')
                }
                show={
                    <ConditionallyRender
                        condition={paths.length > 1}
                        show={
                            <StyledBreadcrumbs aria-label='Breadcrumbs'>
                                {paths.map((path, index) => {
                                    const lastItem = index === paths.length - 1;
                                    if (lastItem) {
                                        return (
                                            <StyledCurrentPage key={path}>
                                                {path}
                                            </StyledCurrentPage>
                                        );
                                    }

                                    let link = '/';

                                    paths.forEach((path, i) => {
                                        if (i !== index && i < index) {
                                            link += `${path}/`;
                                        } else if (i === index) {
                                            link += path;
                                        }
                                    });

                                    return (
                                        <StyledLink key={path} to={link}>
                                                {path}
                                        </StyledLink>
                                    );
                                })}
                            </StyledBreadcrumbs>
                        }
                    />
                }
            />
        </StyledBreadcrumbContainer>
    );
};

export default BreadcrumbNav;
