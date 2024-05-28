import { type FC, useState } from 'react';
import { CombinedSelect, type CombinedSelectProps } from './CombinedSelect';
import { DropdownList, type DropdownListProps } from './DropdownList';

type MultiselectListProps = Pick<
    CombinedSelectProps,
    'button' | 'onOpen' | 'onClose' | 'description'
> &
    Pick<DropdownListProps, 'search' | 'options'> & {
        selectedOptions: Set<string>;
        onChange: (values: Set<string>) => void;
    };

export const MultiSelectList: FC<MultiselectListProps> = ({
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
        <CombinedSelect {...rest} anchorEl={anchorEl} setAnchorEl={setAnchorEl}>
            <DropdownList
                multiselect={{
                    selectedOptions,
                }}
                onChange={handleToggle}
                {...rest}
            />
        </CombinedSelect>
    );
};
