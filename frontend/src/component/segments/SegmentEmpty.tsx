import { styled, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { CREATE_SEGMENT } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import AccessContext from 'contexts/AccessContext';
import { useContext } from 'react';

const StyledDiv = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: theme.spacing(6),
    marginLeft: 'auto',
    marginRight: 'auto',
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.mainHeader,
    marginBottom: theme.spacing(2.5),
}));

const StyledParagraph = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
    maxWidth: 515,
    marginBottom: theme.spacing(2.5),
    textAlign: 'center',
}));

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    color: theme.palette.primary.main,
    fontWeight: theme.fontWeight.bold,
}));

export const SegmentEmpty = () => {
    const { hasAccess } = useContext(AccessContext);

    return (
        <StyledDiv>
            <StyledTypography>No segments yet!</StyledTypography>
            <StyledParagraph>
                Segment makes it easy for you to define who should be exposed to
                your feature. The segment is often a collection of constraints
                and can be reused.
            </StyledParagraph>
            <ConditionallyRender
                condition={hasAccess(CREATE_SEGMENT)}
                show={
                    <StyledLink to="/segments/create">
                        Create your first segment
                    </StyledLink>
                }
            />
        </StyledDiv>
    );
};
