import { Box, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { useSearchHighlightContext } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Highlighter } from 'component/common/Highlighter/Highlighter';
import { Truncator } from 'component/common/Truncator/Truncator';
import type { FC } from 'react';

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1, 0, 1, 2),
}));

const StyledLink = styled(Link)(() => ({
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

export const FeaturesCell: FC<FeaturesCellProps> = ({ value, project }) => {
    const { searchQuery } = useSearchHighlightContext();
    const featureNames = value?.map((feature: any) => feature.name);
    return (
        <StyledBox>
            <ConditionallyRender
                condition={featureNames?.length < 3}
                show={featureNames?.map((featureName: string) => (
                    <StyledLink
                        key={featureName}
                        to={`/projects/${project}/features/${featureName}`}
                    >
                        <Truncator lines={1} title={featureName} arrow>
                            <Highlighter search={searchQuery}>
                                {featureName}
                            </Highlighter>
                        </Truncator>
                    </StyledLink>
                ))}
                elseShow={
                    <TooltipLink
                        tooltipProps={{ maxWidth: '800px' }}
                        tooltip={
                            <StyledTooltipContainer>
                                {featureNames?.map((featureName: string) => (
                                    <StyledTooltipLink
                                        key={featureName}
                                        to={`/projects/${project}/features/${featureName}`}
                                    >
                                        <Truncator
                                            lines={1}
                                            title={featureName}
                                            arrow
                                        >
                                            <Highlighter search={searchQuery}>
                                                {featureName}
                                            </Highlighter>
                                        </Truncator>
                                    </StyledTooltipLink>
                                ))}
                            </StyledTooltipContainer>
                        }
                    >
                        {featureNames?.length} flags
                    </TooltipLink>
                }
            />
        </StyledBox>
    );
};
