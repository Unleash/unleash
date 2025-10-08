import { useState } from 'react';
import {
    Button,
    MenuItem,
    Select,
    styled,
    TextField,
    type SelectChangeEvent,
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import {
    useMilestoneProgressionForm,
    type TimeUnit,
} from '../hooks/useMilestoneProgressionForm.js';
import { useMilestoneProgressionsApi } from 'hooks/api/actions/useMilestoneProgressionsApi/useMilestoneProgressionsApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';

const StyledFormContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.elevation1,
    width: '100%',
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    position: 'relative',
}));

const StyledTopRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledIcon = styled(BoltIcon)(({ theme }) => ({
    color: theme.palette.common.white,
    fontSize: 18,
    flexShrink: 0,
    backgroundColor: theme.palette.primary.main,
    borderRadius: '50%',
    padding: theme.spacing(0.25),
}));

const StyledLabel = styled('span')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.typography.body2.fontSize,
    flexShrink: 0,
}));

const StyledInputGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '60px',
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.spacing(0.5),
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
        },
    },
    '& input': {
        textAlign: 'center',
        padding: theme.spacing(0.75, 1),
        fontSize: theme.typography.body2.fontSize,
        fontWeight: theme.typography.fontWeightMedium,
    },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    width: '100px',
    fontSize: theme.typography.body2.fontSize,
    borderRadius: theme.spacing(0.5),
    '& .MuiOutlinedInput-notchedOutline': {
        borderRadius: theme.spacing(0.5),
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
    },
    '& .MuiSelect-select': {
        padding: theme.spacing(0.75, 1.25),
    },
}));

const StyledButtonGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: theme.spacing(1),
    marginTop: theme.spacing(0.5),
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledErrorMessage = styled('span')(({ theme }) => ({
    color: theme.palette.error.main,
    fontSize: theme.typography.body2.fontSize,
    marginRight: 'auto',
}));

interface IMilestoneProgressionFormProps {
    sourceMilestoneId: string;
    targetMilestoneId: string;
    projectId: string;
    environment: string;
    onSave: () => void;
    onCancel: () => void;
}

export const MilestoneProgressionForm = ({
    sourceMilestoneId,
    targetMilestoneId,
    projectId,
    environment,
    onSave,
    onCancel,
}: IMilestoneProgressionFormProps) => {
    const form = useMilestoneProgressionForm(
        sourceMilestoneId,
        targetMilestoneId,
    );
    const { createMilestoneProgression } = useMilestoneProgressionsApi();
    const { setToastData, setToastApiError } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTimeUnitChange = (event: SelectChangeEvent<unknown>) => {
        const newUnit = event.target.value as TimeUnit;
        form.setTimeUnit(newUnit);
    };

    const handleTimeValueChange = (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const inputValue = event.target.value;
        // Only allow digits
        if (inputValue === '' || /^\d+$/.test(inputValue)) {
            const value = inputValue === '' ? 0 : Number.parseInt(inputValue);
            form.setTimeValue(value);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        if (!form.validate()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await createMilestoneProgression(
                projectId,
                environment,
                form.getProgressionPayload(),
            );
            setToastData({
                type: 'success',
                text: 'Automation configured successfully',
            });
            onSave();
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
        }
    };

    return (
        <StyledFormContainer onKeyDown={handleKeyDown}>
            <StyledTopRow>
                <StyledIcon />
                <StyledLabel>Proceed to the next milestone after</StyledLabel>
                <StyledInputGroup>
                    <StyledTextField
                        type='text'
                        inputMode='numeric'
                        value={form.timeValue}
                        onChange={handleTimeValueChange}
                        onPaste={(e) => {
                            const pastedText = e.clipboardData.getData('text');
                            if (!/^\d+$/.test(pastedText)) {
                                e.preventDefault();
                            }
                        }}
                        inputProps={{
                            pattern: '[0-9]*',
                            'aria-label': 'Time duration value',
                            'aria-describedby': 'time-unit-select',
                        }}
                        size='small'
                    />
                    <StyledSelect
                        value={form.timeUnit}
                        onChange={handleTimeUnitChange}
                        size='small'
                        aria-label='Time unit'
                        id='time-unit-select'
                    >
                        <MenuItem value='minutes'>Minutes</MenuItem>
                        <MenuItem value='hours'>Hours</MenuItem>
                        <MenuItem value='days'>Days</MenuItem>
                    </StyledSelect>
                </StyledInputGroup>
            </StyledTopRow>
            <StyledButtonGroup>
                {form.errors.time && (
                    <StyledErrorMessage>{form.errors.time}</StyledErrorMessage>
                )}
                <Button
                    variant='outlined'
                    onClick={onCancel}
                    size='small'
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    variant='contained'
                    color='primary'
                    onClick={handleSubmit}
                    size='small'
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
            </StyledButtonGroup>
        </StyledFormContainer>
    );
};
