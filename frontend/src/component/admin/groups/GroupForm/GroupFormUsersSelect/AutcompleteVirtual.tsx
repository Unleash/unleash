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
        estimateSize: () => 56,
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

type TProps<T, M extends boolean | undefined> = Omit<
    AutocompleteProps<T, M, boolean, false>,
    'autoHighlight' | 'disableListWrap' | 'ListboxComponent' | 'groupBy'
> & { isLoading?: boolean };

function AutocompleteVirtual<T, M extends boolean | undefined>(
    props: TProps<T, M>,
) {
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
            disableListWrap
            getOptionLabel={getOptionLabel}
            ListboxComponent={ListboxComponent}
            renderOption={(...props) => {
                return [props[0], renderOption(...props)] as ReactNode;
            }}
        />
    );
}

export default AutocompleteVirtual;
