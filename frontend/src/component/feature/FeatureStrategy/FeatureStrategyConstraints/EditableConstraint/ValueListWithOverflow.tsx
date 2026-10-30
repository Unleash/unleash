import { forwardRef, type PropsWithChildren } from 'react';
import { FeatureStrategyChip } from 'component/feature/FeatureStrategy/FeatureStrategyChip/FeatureStrategyChip';
import {
    ValueList,
    type ValueListHandle,
    type ValueListProps,
} from './ValueList.tsx';

const MAX_VISIBLE_VALUES = 10;

export const ValueListWithOverflow = forwardRef<
    ValueListHandle,
    PropsWithChildren<ValueListProps>
>(({ values = [], children, ...props }, ref) => {
    const visibleValues = values.slice(0, MAX_VISIBLE_VALUES);
    const overflowCount = values.length - visibleValues.length;

    return (
        <>
            <ValueList ref={ref} values={visibleValues} {...props}>
                {children}
            </ValueList>
            {overflowCount > 0 ? (
                <FeatureStrategyChip
                    label={`and ${overflowCount} more`}
                    aria-label={`and ${overflowCount} more value${overflowCount === 1 ? '' : 's'}`}
                />
            ) : null}
        </>
    );
});
