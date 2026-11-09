import { QuietLink } from 'component/common/QuietLink';
import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import type { FC } from 'react';

export const ChildrenTooltip: FC<{
    childFeatures: string[];
    project: string;
}> = ({ childFeatures, project }) => (
    <TooltipLink
        tooltip={
            <>
                {childFeatures.map((child) => (
                    <QuietLink
                        key={`${project}-${child}`}
                        to={`/projects/${project}/features/${child}`}
                    >
                        <div>{child}</div>
                    </QuietLink>
                ))}
            </>
        }
    >
        {childFeatures.length === 1
            ? '1 feature'
            : `${childFeatures.length} features`}
    </TooltipLink>
);
