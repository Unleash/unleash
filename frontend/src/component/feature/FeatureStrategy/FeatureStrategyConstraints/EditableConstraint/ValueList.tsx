import { chipClasses, styled } from '@mui/material';
import {
    forwardRef,
    type PropsWithChildren,
    useImperativeHandle,
    useRef,
} from 'react';
import { FeatureStrategyChip } from 'component/feature/FeatureStrategy/FeatureStrategyChip/FeatureStrategyChip';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';

const ValueListWrapper = styled('div')({
    display: 'contents',
});

const StyledList = styled('ul')({
    listStyle: 'none',
    display: 'contents',
});

const EditableValueChip = styled(FeatureStrategyChip)(({ theme }) => ({
    cursor: 'text',
    [`&.${chipClasses.clickable}:hover`]: {
        background: theme.palette.primary.container,
        outlineColor: theme.palette.primary.light,
    },
}));

export type ValueListProps = {
    values?: string[];
    removeValue: (value: string) => void;
    // the element that should receive focus when all value chips are deleted
    getExternalFocusTarget: () => HTMLElement | null;
    getValueTitle?: (value: string) => string | undefined;
    getValueLabel?: (value: string) => string;
    // when set, values can be clicked to edit them in place
    onEditValue?: (value: string) => void;
};

export type ValueListHandle = {
    focusValue: (index: number) => void;
};

export const ValueList = forwardRef<
    ValueListHandle,
    PropsWithChildren<ValueListProps>
>(
    (
        {
            values = [],
            removeValue,
            getExternalFocusTarget,
            getValueTitle,
            getValueLabel,
            onEditValue,
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

        const Chip = onEditValue ? EditableValueChip : FeatureStrategyChip;

        return (
            <ValueListWrapper>
                {children}
                <StyledList>
                    {values.map((value, index) => {
                        const chip = (
                            <Chip
                                ref={(el: HTMLDivElement | null) => {
                                    constraintElementRefs.current[index] = el;
                                }}
                                labelSx={{
                                    display: 'block',
                                    whiteSpace: 'normal',
                                    userSelect: 'text',
                                }}
                                label={getValueLabel?.(value) ?? value}
                                title={getValueTitle?.(value)}
                                onClick={
                                    onEditValue
                                        ? () => onEditValue(value)
                                        : undefined
                                }
                                onDelete={() => {
                                    nextFocusTarget(index)?.focus();
                                    removeValue(value);
                                }}
                            />
                        );
                        return (
                            <li key={value}>
                                {onEditValue ? (
                                    <HtmlTooltip
                                        title='Click to edit'
                                        arrow
                                        describeChild
                                    >
                                        {chip}
                                    </HtmlTooltip>
                                ) : (
                                    chip
                                )}
                            </li>
                        );
                    })}
                </StyledList>
            </ValueListWrapper>
        );
    },
);
