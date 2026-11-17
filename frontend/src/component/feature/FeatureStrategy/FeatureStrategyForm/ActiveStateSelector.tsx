import { useState } from 'react';
import { Button, styled, Typography } from '@mui/material';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import { DropdownList } from 'component/common/DialogFormTemplate/ConfigButtons/DropdownList.tsx';
import { StyledPopover } from 'component/common/DialogFormTemplate/ConfigButtons/shared.styles.tsx';

type StrategyState = 'active' | 'inactive';

const options: Array<{
    value: StrategyState;
    label: string;
    description: string;
}> = [
    {
        value: 'active',
        label: 'Active',
        description: 'Takes effect the moment the environment is enabled',
    },
    {
        value: 'inactive',
        label: 'Inactive',
        description: 'Saved, but nobody is exposed until you activate it',
    },
];

const TriggerButton = styled(Button)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: 'normal',
    svg: {
        color: theme.palette.text.secondary,
    },
}));

const CurrentState = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    marginInlineStart: '1ch',
}));

type ActiveStateSelectorProps = {
    currentState: StrategyState;
    onChange: (nextState: StrategyState) => void;
};

export const ActiveStateSelector = ({
    currentState,
    onChange,
}: ActiveStateSelectorProps) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const selectedLabel = options.find(
        (option) => option.value === currentState,
    )?.label;

    return (
        <>
            <TriggerButton
                type='button'
                variant='text'
                endIcon={<KeyboardArrowDownOutlined />}
                aria-haspopup='true'
                aria-expanded={Boolean(anchorEl)}
                onClick={(e) => setAnchorEl(e.currentTarget)}
            >
                Strategy status
                <CurrentState>{selectedLabel}</CurrentState>
            </TriggerButton>
            <StyledPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <DropdownList<StrategyState>
                    options={options}
                    selectedValue={currentState}
                    onChange={(value) => {
                        onChange(value);
                        setAnchorEl(null);
                    }}
                />
            </StyledPopover>
        </>
    );
};
