import { ListItemText, styled } from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
    forwardRef,
    useImperativeHandle,
    useState,
    type KeyboardEvent,
} from 'react';
import { StyledCheckbox, StyledListItem } from './FilterItem.styles';

const ROW_ESTIMATE = 36;

const StyledScrollContainer = styled('div')({
    overflow: 'auto',
    minHeight: 0,
    maxHeight: '60vh',
});

const StyledVirtualList = styled('ul')({
    margin: 0,
    padding: 0,
    listStyle: 'none',
    width: '100%',
    position: 'relative',
});

export interface VirtualizedFilterOptionsHandle {
    focusFirst: () => void;
}

interface VirtualizedFilterOptionsProps {
    options: Array<{ label: string; value: string }>;
    selectedValues: string[];
    onToggle: (value: string) => void;
    onEscapeToSearch: () => void;
}

export const VirtualizedFilterOptions = forwardRef<
    VirtualizedFilterOptionsHandle,
    VirtualizedFilterOptionsProps
>(({ options, selectedValues, onToggle, onEscapeToSearch }, ref) => {
    const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
        null,
    );

    const rowVirtualizer = useVirtualizer({
        count: options.length,
        getScrollElement: () => scrollElement,
        estimateSize: () => ROW_ESTIMATE,
        overscan: 5,
        initialRect: { width: 0, height: 800 },
    });

    const focusItem = (itemIndex: number) => {
        if (itemIndex < 0 || itemIndex >= options.length) return;
        const findEl = () =>
            scrollElement?.querySelector(
                `[data-index="${itemIndex}"]`,
            ) as HTMLElement | null;
        const el = findEl();
        if (el) {
            el.focus();
            return;
        }
        rowVirtualizer.scrollToIndex(itemIndex, { align: 'auto' });
        requestAnimationFrame(() => {
            findEl()?.focus();
        });
    };

    useImperativeHandle(ref, () => ({
        focusFirst: () => focusItem(0),
    }));

    const handleItemKeyDown = (event: KeyboardEvent, itemIndex: number) => {
        if (event.key === 'ArrowDown' && itemIndex < options.length - 1) {
            event.preventDefault();
            focusItem(itemIndex + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (itemIndex === 0) {
                onEscapeToSearch();
            } else {
                focusItem(itemIndex - 1);
            }
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggle(options[itemIndex].value);
        }
    };

    return (
        <StyledScrollContainer ref={setScrollElement}>
            <StyledVirtualList
                style={{ height: rowVirtualizer.getTotalSize() }}
            >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const option = options[virtualRow.index];
                    const labelId = `checkbox-list-label-${option.value}`;
                    return (
                        <StyledListItem
                            key={option.value}
                            dense
                            disablePadding
                            tabIndex={0}
                            data-index={virtualRow.index}
                            ref={rowVirtualizer.measureElement}
                            onClick={() => onToggle(option.value)}
                            onKeyDown={(event) =>
                                handleItemKeyDown(event, virtualRow.index)
                            }
                            style={{
                                position: 'absolute',
                                top: `${virtualRow.start}px`,
                                left: 0,
                                width: '100%',
                            }}
                        >
                            <StyledCheckbox
                                edge='start'
                                checked={selectedValues.includes(option.value)}
                                tabIndex={-1}
                                slotProps={{
                                    input: { 'aria-labelledby': labelId },
                                }}
                                size='small'
                            />
                            <ListItemText id={labelId} primary={option.label} />
                        </StyledListItem>
                    );
                })}
            </StyledVirtualList>
        </StyledScrollContainer>
    );
});
