import { TooltipLink } from 'component/common/TooltipLink/TooltipLink';
import type { FC } from 'react';

export const VariantsTooltip: FC<{
    variants: string[];
}> = ({ variants }) => {
    if (variants.length === 1 && variants[0].length < 20) {
        return <span>{variants[0]}</span>;
    }
    return (
        <TooltipLink
            tooltip={
                <>
                    {variants.map((child) => (
                        <div>{child}</div>
                    ))}
                </>
            }
        >
            {variants.length === 1
                ? '1 variant'
                : `${variants.length} variants`}
        </TooltipLink>
    );
};
