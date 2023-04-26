import { Box, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { VFC } from 'react';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import { TooltipLink } from '../../../common/TooltipLink/TooltipLink';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    padding: theme.spacing(1, 0, 1, 2),
}));

const StyledLink = styled(Link)(({ theme }) => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

const StyledTooltipLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    '&:hover, &:focus': {
        textDecoration: 'underline',
    },
}));

const StyledTooltipContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    fontSize: theme.fontSizes.smallBody,
    width: '100%',
    whiteSpace: 'nowrap',
}));

interface FeaturesCellProps {
    value: any;
    project: string;
}

export const FeaturesCell: VFC<FeaturesCellProps> = ({ value, project }) => {
    const featureNames = value?.map((feature: any) => feature.name);
    return (
        <StyledBox>
            <ConditionallyRender
                condition={featureNames?.length < 3}
                show={featureNames?.map((featureName: string) => (
                    <StyledLink
                        title={featureName}
                        to={`/projects/${project}/features/${featureName}`}
                    >
                        {featureName}
                    </StyledLink>
                ))}
                elseShow={
                    <TooltipLink
                        tooltipProps={{ maxWidth: '800px' }}
                        tooltip={
                            <StyledTooltipContainer>
                                {featureNames?.map((featureName: string) => (
                                    <StyledTooltipLink
                                        title={featureName}
                                        to={`/projects/${project}/features/${featureName}`}
                                    >
                                        {featureName}
                                    </StyledTooltipLink>
                                ))}
                            </StyledTooltipContainer>
                        }
                    >
                        {featureNames?.length} toggles
                    </TooltipLink>
                }
            />
        </StyledBox>
    );
};
