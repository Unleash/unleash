import {
    HTMLAttributes,
    forwardRef,
    useCallback,
    useRef,
    useState,
} from 'react';
import { Autocomplete, AutocompleteProps, styled } from '@mui/material';
import { GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso';

const VIRTUALIZED_THRESHOLD = 100;

const StyledDiv = styled('div')(({ theme }) => ({
    'div[data-item-group-index]': {
        '.MuiAutocomplete-option': {
            paddingLeft: theme.spacing(3),
        },
    },
}));

interface IComboProps<
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined
> extends AutocompleteProps<T, Multiple, DisableClearable, FreeSolo> {
    virtualized?: 'auto' | 'always' | 'never' | undefined;
}

export const Combo = <
    T,
    Multiple extends boolean | undefined = false,
    DisableClearable extends boolean | undefined = false,
    FreeSolo extends boolean | undefined = false
>({
    virtualized = 'auto',
    ...props
}: IComboProps<T, Multiple, DisableClearable, FreeSolo>) => {
    if (
        virtualized === 'never' ||
        (virtualized === 'auto' && props.options.length < VIRTUALIZED_THRESHOLD)
    )
        return <Autocomplete {...props} />;

    return (
        <Autocomplete
            {...props}
            disableListWrap
            ListboxComponent={ListboxComponent}
        />
    );
};

const ListboxComponent = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
    const virtuosoRef = useRef<GroupedVirtuosoHandle>(null);
    const [currentItemIndex, setCurrentItemIndex] = useState(-1);

    const elements = (props.children || []) as JSX.Element[];

    const groups = elements.map(({ props }) => {
        const [header, list] = props.children;
        const items = list.props.children;
        return {
            total: items.length,
            header,
            items,
        };
    });

    const groupCounts = groups.map(({ total }) => total);

    const keyDownCallback = useCallback(
        e => {
            let nextIndex: number | null = null;

            if (e.code === 'ArrowUp') {
                nextIndex = Math.max(0, currentItemIndex - 1);
            } else if (e.code === 'ArrowDown') {
                nextIndex = Math.min(
                    groupCounts.reduce((a, b) => a + b, 0),
                    currentItemIndex + 1
                );
            }

            if (nextIndex !== null) {
                setCurrentItemIndex(nextIndex);
                virtuosoRef.current?.scrollIntoView({
                    index: nextIndex,
                    behavior: 'auto',
                });
                e.preventDefault();
            }
        },
        [currentItemIndex, virtuosoRef, setCurrentItemIndex]
    );

    const selectItem = useCallback(
        e => {
            const li = e.target.closest('li');
            if (li) setCurrentItemIndex(+li.dataset.optionIndex);
        },
        [currentItemIndex, virtuosoRef, setCurrentItemIndex]
    );

    const scrollUp = useCallback(() => {
        virtuosoRef.current?.scrollToIndex({
            index: 0,
            behavior: 'auto',
        });
    }, [virtuosoRef]);

    const scrollerRef = useCallback(
        element => {
            if (element) {
                window.addEventListener('keydown', keyDownCallback);
                window.addEventListener('click', selectItem);
                window.addEventListener('keypress', scrollUp);
            } else {
                window.removeEventListener('keydown', keyDownCallback);
                window.removeEventListener('click', selectItem);
                window.removeEventListener('keypress', scrollUp);
            }
        },
        [keyDownCallback]
    );

    return (
        <StyledDiv ref={ref} {...props}>
            <GroupedVirtuoso
                ref={virtuosoRef}
                scrollerRef={scrollerRef}
                increaseViewportBy={{ top: 100, bottom: 100 }}
                style={{ height: '40vh' }}
                groupCounts={groupCounts}
                groupContent={index => groups[index].header}
                itemContent={(index, groupIndex) => {
                    const groupedIndex =
                        index -
                        groupCounts
                            .slice(0, groupIndex)
                            .reduce((a, b) => a + b, 0);
                    return groups[groupIndex].items[groupedIndex];
                }}
            />
        </StyledDiv>
    );
});
