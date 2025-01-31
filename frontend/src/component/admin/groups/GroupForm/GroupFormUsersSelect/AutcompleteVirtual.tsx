import { useVirtualizer } from '@tanstack/react-virtual';
import {
    type HTMLAttributes,
    type ReactElement,
    type ReactNode,
    cloneElement,
    forwardRef,
    useRef,
} from 'react';
import { Autocomplete, type AutocompleteProps } from '@mui/material';

/**
 * @description Autocomplete with virtualization.
 *
 */

const ListboxComponent = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLElement>
>(function ListboxComponent(props, ref) {
    const { children, ...other } = props;

    const parentRef = useRef(null);

    const itemData: ReactElement[] = [];

    (children as ReactElement[]).forEach((item: ReactElement) => {
        itemData.push(item);
    });

    const rowVirtualizer = useVirtualizer({
        count: itemData.length ?? 0,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 64,
        overscan: 3,
    });

    return (
        <div ref={ref}>
            <div ref={parentRef} {...other}>
                <ul
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const dataSet = itemData[virtualRow.index] as Record<
                            string,
                            any
                        >;

                        if (!dataSet) {
                            return null;
                        }

                        const inlineStyle = {
                            position: 'absolute',
                            left: 0,
                            width: '100%',
                            top: `${virtualRow.start}px`,
                            padding: 0,
                        };

                        return cloneElement(dataSet[1], {
                            ...dataSet[0],
                            ref: rowVirtualizer.measureElement,
                            key: virtualRow.key,
                            'data-index': virtualRow.index,
                            style: inlineStyle,
                        });
                    })}
                </ul>
            </div>
        </div>
    );
});

/**
 * @link Props: https://mui.com/material-ui/api/autocomplete/
 *
 */

/**
 * [BUG]: use getOptionDisabled + ArrowKeyUp/Down with virtualization [12/16/2023]
 *
 */

type TProps<T> = Omit<
    AutocompleteProps<T, false, boolean, false>,
    | 'autoHighlight'
    | 'disableListWrap'
    | 'ListboxComponent'
    | 'groupBy'
    | 'multiple'
> & { isLoading?: boolean };

function AutocompleteVirtual<T>(props: TProps<T>) {
    const {
        getOptionLabel,
        renderOption,
        className,
        isLoading,
        ...restAutocompleteProps
    } = props;

    return (
        <Autocomplete
            {...restAutocompleteProps}
            // open
            className={`autocomplete__virtual ${className || ''}`}
            autoHighlight
            disableListWrap
            getOptionLabel={getOptionLabel}
            ListboxComponent={ListboxComponent}
            renderOption={(_props, option, { selected }) => {
                const opt = getOptionLabel?.(option) ?? option;
                return [
                    _props,
                    renderOption(_props, option, { selected }),
                ] as ReactNode;
            }}
            onKeyDown={(event) => {
                if (!restAutocompleteProps.getOptionDisabled) {
                    return;
                }
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                    event.defaultMuiPrevented = true;
                }
            }}
        />
    );
}

export default AutocompleteVirtual;
