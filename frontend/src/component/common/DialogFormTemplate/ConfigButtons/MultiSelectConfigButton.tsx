import { useState } from 'react';
import { ConfigButton, type ConfigButtonProps } from './ConfigButton.tsx';
import { DropdownList, type DropdownListProps } from './DropdownList.tsx';

type MultiSelectConfigButtonProps<T> = Pick<
    ConfigButtonProps,
    'button' | 'onOpen' | 'onClose' | 'description' | 'tooltip'
> &
    Pick<DropdownListProps<T>, 'search' | 'options'> & {
        selectedOptions: Set<T>;
        onChange: (values: Set<T>) => void;
    };

export function MultiSelectConfigButton<T = string>({
    selectedOptions,
    onChange,
    ...rest
}: MultiSelectConfigButtonProps<T>) {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();

    const handleToggle = (value: T) => {
        if (selectedOptions.has(value)) {
            selectedOptions.delete(value);
        } else {
            selectedOptions.add(value);
        }

        onChange(new Set(selectedOptions));
    };

    return (
        <ConfigButton {...rest} anchorEl={anchorEl} setAnchorEl={setAnchorEl}>
            <DropdownList<T>
                multiselect={{
                    selectedOptions,
                }}
                onChange={handleToggle}
                {...rest}
            />
        </ConfigButton>
    );
}
