import { useVirtualizer } from '@tanstack/react-virtual';
import {
    Children,
    type HTMLAttributes,
    type ReactElement,
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
    const items = Children.toArray(children);

    const rowVirtualizer = useVirtualizer({
        count: Children.count(children),
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
                        const element = items[virtualRow.index] as ReactElement;

                        if (!element) {
                            return null;
                        }

                        const inlineStyle = {
                            position: 'absolute',
                            left: 0,
                            width: '100%',
                            top: `${virtualRow.start}px`,
                        };

                        return cloneElement(element, {
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
    const { getOptionLabel, className, isLoading, ...restAutocompleteProps } =
        props;

    return (
        <div aria-busy={isLoading} aria-live='polite'>
            <Autocomplete
                {...restAutocompleteProps}
                disableListWrap
                getOptionLabel={getOptionLabel}
                ListboxComponent={ListboxComponent}
                noOptionsText={isLoading ? 'Loading…' : 'No options'}
            />
        </div>
    );
}

export default AutocompleteVirtual;
