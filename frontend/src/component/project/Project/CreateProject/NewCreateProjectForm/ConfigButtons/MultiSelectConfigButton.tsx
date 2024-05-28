import { type FC, useState } from 'react';
import { ConfigButton, type ConfigButtonProps } from './ConfigButton';
import { DropdownList, type DropdownListProps } from './DropdownList';

type MultiSelectConfigButtonProps = Pick<
    ConfigButtonProps,
    'button' | 'onOpen' | 'onClose' | 'description'
> &
    Pick<DropdownListProps, 'search' | 'options'> & {
        selectedOptions: Set<string>;
        onChange: (values: Set<string>) => void;
    };

export const MultiSelectConfigButton: FC<MultiSelectConfigButtonProps> = ({
    selectedOptions,
    onChange,
    ...rest
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>();

    const handleToggle = (value: string) => {
        if (selectedOptions.has(value)) {
            selectedOptions.delete(value);
        } else {
            selectedOptions.add(value);
        }

        onChange(new Set(selectedOptions));
    };

    return (
        <ConfigButton {...rest} anchorEl={anchorEl} setAnchorEl={setAnchorEl}>
            <DropdownList
                multiselect={{
                    selectedOptions,
                }}
                onChange={handleToggle}
                {...rest}
            />
        </ConfigButton>
    );
};
