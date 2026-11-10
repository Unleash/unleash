import { useVirtualizer } from '@tanstack/react-virtual';
import {
    type CSSProperties,
    Children,
    type ComponentPropsWithRef,
    type HTMLAttributes,
    cloneElement,
    forwardRef,
    isValidElement,
    useRef,
} from 'react';
import {
    AutocompleteField,
    type AutocompleteFieldProps,
} from '../AutocompleteField/AutocompleteField';

type VirtualizedRowProps = ComponentPropsWithRef<'li'> & {
    'data-index'?: number;
};

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
                        const element = items[virtualRow.index];

                        if (!isValidElement<VirtualizedRowProps>(element)) {
                            return null;
                        }

                        const inlineStyle: CSSProperties = {
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

type AutocompleteVirtualProps<T, M extends boolean | undefined> = Omit<
    AutocompleteFieldProps<T, M, boolean, false>,
    'disableListWrap' | 'ListboxComponent'
> & {
    virtualThreshold?: number;
};

// This component has a default threshold of 250 when virtualization kicks in
// When virtualization is enabled we skip groupBy
function AutocompleteVirtual<T, M extends boolean | undefined>(
    props: AutocompleteVirtualProps<T, M>,
) {
    const { virtualThreshold = 250, ...rest } = props;

    const isLargeList = rest.options.length > virtualThreshold;
    const virtualProps = isLargeList
        ? { ListboxComponent, groupBy: undefined }
        : {};

    return <AutocompleteField {...rest} disableListWrap {...virtualProps} />;
}

export default AutocompleteVirtual;
