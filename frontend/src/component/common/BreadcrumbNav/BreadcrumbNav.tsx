import Breadcrumbs from '@mui/material/Breadcrumbs';
import { Link, useLocation } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { useContext } from 'react';
import StringTruncator from '../StringTruncator/StringTruncator';
import { styled } from '@mui/material';

const StyledBreadcrumbContainer = styled('div')(({ theme }) => ({
    height: theme.spacing(2.5),
    margin: theme.spacing(2, 0),
}));

const StyledParagraph = styled('p')({
    color: 'inherit',
    '& > *': {
        verticalAlign: 'middle',
    },
});

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    '& > *': {
        verticalAlign: 'middle',
    },
    color: theme.palette.primary.main,
}));

const BreadcrumbNav = () => {
    const { isAdmin } = useContext(AccessContext);
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
                item !== 'features' &&
                item !== 'features2' &&
                item !== 'create-toggle' &&
                item !== 'settings' &&
                item !== 'profile'
        );

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
                            <Breadcrumbs aria-label="Breadcrumbs">
                                {paths.map((path, index) => {
                                    const lastItem = index === paths.length - 1;
                                    if (lastItem) {
                                        return (
                                            <StyledParagraph key={path}>
                                                <StringTruncator
                                                    text={path}
                                                    maxWidth="200"
                                                    maxLength={25}
                                                />
                                            </StyledParagraph>
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
                                        <StyledLink key={path} to={link}>
                                            <StringTruncator
                                                maxLength={25}
                                                text={path}
                                                maxWidth="200"
                                            />
                                        </StyledLink>
                                    );
                                })}
                            </Breadcrumbs>
                        }
                    />
                }
            />
        </StyledBreadcrumbContainer>
    );
};

export default BreadcrumbNav;
