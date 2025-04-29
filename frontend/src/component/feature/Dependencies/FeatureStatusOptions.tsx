import type { FC } from 'react';
import type { ParentValue } from './constants.ts';
import { styled } from '@mui/material';
import GeneralSelect from '../../common/GeneralSelect/GeneralSelect.tsx';

export const StyledSelect = styled(GeneralSelect)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
}));
export const FeatureStatusOptions: FC<{
    parentValue: ParentValue;
    onSelect: (parent: string) => void;
}> = ({ onSelect, parentValue }) => {
    return (
        <StyledSelect
            fullWidth
            options={[
                { key: 'enabled', label: 'enabled' },
                {
                    key: 'enabled_with_variants',
                    label: 'enabled with variants',
                },
                { key: 'disabled', label: 'disabled' },
            ]}
            value={parentValue.status}
            onChange={onSelect}
        />
    );
};
