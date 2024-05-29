import { type FC, useState } from 'react';
import { ConfigButton, type ConfigButtonProps } from './ConfigButton';
import { DropdownList, type DropdownListProps } from './DropdownList';

type SingleSelectConfigButtonProps = Pick<
    ConfigButtonProps,
    'button' | 'onOpen' | 'onClose' | 'description'
> &
    Pick<DropdownListProps, 'search' | 'onChange' | 'options'>;

export const SingleSelectConfigButton: FC<SingleSelectConfigButtonProps> = ({
    onChange,
    ...props
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();
    const [recentlyClosed, setRecentlyClosed] = useState(false);

    const handleChange = (value: any) => {
        onChange(value);
        setAnchorEl(null);
        props.onClose && props.onClose();

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
            <DropdownList {...props} onChange={handleChange} />
        </ConfigButton>
    );
};
