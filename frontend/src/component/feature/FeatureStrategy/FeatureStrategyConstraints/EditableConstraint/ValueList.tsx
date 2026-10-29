import { styled } from '@mui/material';
import {
    forwardRef,
    type PropsWithChildren,
    useImperativeHandle,
    useRef,
} from 'react';
import { FeatureStrategyChip } from 'component/feature/FeatureStrategy/FeatureStrategyChip/FeatureStrategyChip';

const ValueListWrapper = styled('div')({
    display: 'contents',
});

const StyledList = styled('ul')({
    listStyle: 'none',
    display: 'contents',
});

type Props = {
    values?: string[];
    removeValue: (value: string) => void;
    // the element that should receive focus when all value chips are deleted
    getExternalFocusTarget: () => HTMLElement | null;
    getValueTitle?: (value: string) => string | undefined;
};

export type ValueListHandle = {
    focusValue: (index: number) => void;
};

export const ValueList = forwardRef<ValueListHandle, PropsWithChildren<Props>>(
    (
        {
            values = [],
            removeValue,
            getExternalFocusTarget,
            getValueTitle,
            children,
        },
        ref,
    ) => {
        const constraintElementRefs: React.MutableRefObject<
            (HTMLDivElement | null)[]
        > = useRef([]);

        useImperativeHandle(ref, () => ({
            focusValue: (index) =>
                constraintElementRefs.current[index]?.focus(),
        }));

        const nextFocusTarget = (deletedIndex: number) => {
            if (deletedIndex === values.length - 1) {
                if (deletedIndex === 0) {
                    return getExternalFocusTarget();
                } else {
                    return constraintElementRefs.current[deletedIndex - 1];
                }
            } else {
                return constraintElementRefs.current[deletedIndex + 1];
            }
        };

        return (
            <ValueListWrapper>
                <StyledList>
                    {values.map((value, index) => (
                        <li key={value}>
                            <FeatureStrategyChip
                                ref={(el) => {
                                    constraintElementRefs.current[index] = el;
                                }}
                                labelSx={{
                                    display: 'block',
                                    whiteSpace: 'normal',
                                    userSelect: 'text',
                                }}
                                label={value}
                                title={getValueTitle?.(value)}
                                onDelete={() => {
                                    nextFocusTarget(index)?.focus();
                                    removeValue(value);
                                }}
                            />
                        </li>
                    ))}
                </StyledList>
                {children}
            </ValueListWrapper>
        );
    },
);
