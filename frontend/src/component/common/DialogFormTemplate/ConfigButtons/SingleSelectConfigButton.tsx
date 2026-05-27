import { useState } from 'react';
import { ConfigButton, type ConfigButtonProps } from './ConfigButton.tsx';
import { DropdownList, type DropdownListProps } from './DropdownList.tsx';

type SingleSelectConfigButtonProps<T> = Pick<
    ConfigButtonProps,
    'button' | 'onOpen' | 'onClose' | 'description' | 'tooltip'
> &
    Pick<DropdownListProps<T>, 'search' | 'onChange' | 'options'>;

export function SingleSelectConfigButton<T = string>({
    onChange,
    ...props
}: SingleSelectConfigButtonProps<T>) {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();
    const [recentlyClosed, setRecentlyClosed] = useState(false);

    const handleChange = (value: T) => {
        onChange(value);
        setAnchorEl(null);
        props.onClose?.();

        setRecentlyClosed(true);
        // this is a hack to prevent the button from being
        // auto-clicked after you select an item by pressing enter
        // in the search bar for single-select lists.
        setTimeout(() => setRecentlyClosed(false), 1);
    };

    return (
        <ConfigButton
            {...props}
            preventOpen={recentlyClosed}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
        >
            <DropdownList<T> {...props} onChange={handleChange} />
        </ConfigButton>
    );
}
