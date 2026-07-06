import {
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    styled,
} from '@mui/material';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import GeneralSelect from '../../common/GeneralSelect/GeneralSelect.tsx';
import { FormField } from 'component/common/FormField/FormField';
import { useTheme } from '@mui/material/styles';

interface IEnvironmentChangeRequestProps {
    onChange: (approvals: number | null) => void;
    value: number | null;
}

const StyledRadioGroup = styled(RadioGroup)({
    flexDirection: 'row',
});

const StyledRadioButtonGroup = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

const useApprovalOptions = () => {
    const theme = useTheme();
    const approvalOptions = Array.from(Array(10).keys())
        .map((key) => String(key + 1))
        .map((key) => {
            const labelText = key === '1' ? 'approval' : 'approvals';
            return {
                key,
                label: `${key} ${labelText}`,
                sx: { fontSize: theme.fontSizes.smallBody },
            };
        });
    return approvalOptions;
};

export const ChangeRequestSelector = ({
    onChange,
    value,
}: IEnvironmentChangeRequestProps) => {
    const approvalOptions = useApprovalOptions();

    return (
        <FormControl component='fieldset'>
            <StyledRadioGroup
                data-loading
                value={value ? 'yes' : 'no'}
                onChange={(event) => {
                    if (event.target.value === 'yes') {
                        onChange(1);
                    } else {
                        onChange(null);
                    }
                }}
            >
                <StyledRadioButtonGroup>
                    <FormControlLabel
                        value='no'
                        label='No'
                        control={<Radio />}
                    />
                    <FormControlLabel
                        value='yes'
                        label='Yes'
                        control={<Radio />}
                    />
                </StyledRadioButtonGroup>
            </StyledRadioGroup>
            {value ? (
                <FormField label='Required approvals'>
                    <GeneralSelect
                        label=''
                        sx={{ width: '160px' }}
                        options={approvalOptions}
                        value={value ? String(value) : undefined}
                        onChange={(approvals) => onChange(Number(approvals))}
                        IconComponent={KeyboardArrowDownOutlined}
                        fullWidth
                    />
                </FormField>
            ) : null}
        </FormControl>
    );
};
