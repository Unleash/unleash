import { StyledLink } from './StyledRow';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import { FC } from 'react';

export const ChildrenTooltip: FC<{
    childFeatures: string[];
    project: string;
}> = ({ childFeatures, project }) => (
    <TooltipLink
        tooltip={
            <>
                {childFeatures.map((child) => (
                    <StyledLink to={`/projects/${project}/features/${child}`}>
                        <div>{child}</div>
                    </StyledLink>
                ))}
            </>
        }
    >
        {childFeatures.length === 1
            ? '1 feature'
            : `${childFeatures.length} features`}
    </TooltipLink>
);
