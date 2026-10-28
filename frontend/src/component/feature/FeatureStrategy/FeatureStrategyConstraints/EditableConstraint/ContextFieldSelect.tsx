import { Button, styled, useTheme } from '@mui/material';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { useRef, useState, type FC } from 'react';
import {
    SelectPopover,
    type SelectOptionGroup,
} from 'component/common/SelectPopover/SelectPopover.tsx';

const TriggerButton = styled(Button)(({ theme }) => ({
    borderColor: theme.palette.divider,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightMedium,
}));

type ContextFieldSelectProps = {
    value: string;
    options: SelectOptionGroup<string>[];
    onChange: (value: string) => void;
};

export const ContextFieldSelect: FC<ContextFieldSelectProps> = ({
    value,
    options,
    onChange,
}) => {
    const theme = useTheme();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);

    return (
        <>
            <TriggerButton
                type='button'
                id='context-field-select'
                name='contextName'
                ref={triggerRef}
                variant='outlined'
                color='inherit'
                size='medium'
                endIcon={<KeyboardArrowDownOutlined />}
                aria-label='Context field'
                onClick={() => setAnchorEl(triggerRef.current)}
            >
                {value || 'Select context field'}
            </TriggerButton>
            <SelectPopover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                optionGroups={options}
                selected={value || undefined}
                onChange={(selected) => onChange(selected ?? '')}
                searchPlaceholderText='Search context fields'
                listMaxHeight={theme.spacing(40)}
            />
        </>
    );
};
