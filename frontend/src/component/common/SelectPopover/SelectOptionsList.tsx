import type { CSSProperties, ElementType, HTMLAttributes } from 'react';
import { Checkbox, ListSubheader, styled } from '@mui/material';
import type { FlatOption } from './useSelectListbox.ts';

const StyledList = styled('ul')(({ theme }) => ({
    listStyle: 'none',
    margin: 0,
    overflowY: 'auto',
    padding: theme.spacing(1, 0),
    '&:empty': {
        padding: 0,
    },
}));

const StyledRow = styled('li')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1, 2),
    cursor: 'pointer',
    fontSize: theme.typography.body2.fontSize,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    '&[aria-disabled="true"]': {
        cursor: 'default',
        color: theme.palette.text.disabled,
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },
}));

const StyledCheckbox = styled(Checkbox)({
    padding: 0,
});

const StyledLabel = styled('span')({
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const StyledDetail = styled('span')(({ theme }) => ({
    marginLeft: 'auto',
    whiteSpace: 'nowrap',
    color: theme.palette.text.secondary,
}));

const StyledGroup = styled('li')(({ theme }) => ({
    '&:not(:last-child)': {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));

const StyledListSubheader = styled(ListSubheader)<{
    component?: ElementType;
}>(({ theme }) => ({
    lineHeight: 'normal',
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    textTransform: 'uppercase',
    color: theme.palette.text.disabled,
    padding: theme.spacing(1, 1.5, 0.5),
}));

type SelectOptionsListProps<T extends string | number> = {
    groupedOptions: ReadonlyArray<{
        key: number;
        index: number;
        group: string;
        options: FlatOption<T>[];
    }>;
    listboxProps: HTMLAttributes<HTMLUListElement>;
    getOptionProps: (opts: {
        option: FlatOption<T>;
        index: number;
    }) => Record<string, unknown>;
    isOptionSelected: (option: FlatOption<T>) => boolean;
    multiple: boolean;
    listMaxHeight?: CSSProperties['maxHeight'];
};

export const SelectOptionsList = <T extends string | number>({
    groupedOptions,
    listboxProps,
    getOptionProps,
    isOptionSelected,
    multiple,
    listMaxHeight,
}: SelectOptionsListProps<T>) => {
    const renderRow = (option: FlatOption<T>, index: number) => {
        const { key, onClick, ...optionProps } = getOptionProps({
            option,
            index,
        }) as { key: string; onClick: () => void } & Record<string, unknown>;
        return (
            <StyledRow
                key={key}
                {...optionProps}
                onClick={option.disabled ? undefined : onClick}
                aria-selected={isOptionSelected(option)}
            >
                {multiple ? (
                    <StyledCheckbox
                        checked={isOptionSelected(option)}
                        tabIndex={-1}
                        size='small'
                        aria-hidden
                        disabled={option.disabled}
                    />
                ) : null}
                <StyledLabel>{option.label}</StyledLabel>
                {option.detail ? (
                    <StyledDetail>{option.detail}</StyledDetail>
                ) : null}
            </StyledRow>
        );
    };

    return (
        <StyledList
            {...listboxProps}
            aria-multiselectable={multiple}
            sx={{ maxHeight: listMaxHeight }}
        >
            {groupedOptions.map((group) => (
                <StyledGroup key={group.key}>
                    {group.group ? (
                        <StyledListSubheader component='div'>
                            {group.group}
                        </StyledListSubheader>
                    ) : null}
                    <StyledList sx={{ padding: 0 }}>
                        {group.options.map((option, idx) =>
                            renderRow(option, group.index + idx),
                        )}
                    </StyledList>
                </StyledGroup>
            ))}
        </StyledList>
    );
};
