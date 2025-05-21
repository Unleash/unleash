import {
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
} from '@mui/material';
import { SelectCounterLabel } from './SelectCounterLabel.js';

interface IExploreCounterFilter {
    counter: string | undefined;
    setCounter: (counter: string) => void;
    counterNames: string[] | undefined;
    labels: Record<string, string[]> | undefined;
    selectLabel: (label: string) => void;
    unselectLabel: (label: string) => void;
    selectLabelValue: (value: string) => void;
    unselectLabelValue: (value: string) => void;
}

export const ExploreCounterFilter = ({
    counterNames,
    labels,
    counter,
    setCounter,
    selectLabel,
    unselectLabel,
    selectLabelValue,
    unselectLabelValue,
}: IExploreCounterFilter) => {
    const counterChanged = (event: SelectChangeEvent<string>) => {
        const selectedCounter = event.target.value as string;
        setCounter(selectedCounter);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                    <FormControl>
                        <InputLabel id='counter-label' size='small'>
                            Counter
                        </InputLabel>
                        <Select
                            label='Counter'
                            labelId='counter-label'
                            id='counter-select'
                            value={counter}
                            onChange={counterChanged}
                            variant='outlined'
                            size='small'
                            sx={{ width: 200, maxWidth: '100%' }}
                        >
                            {counterNames?.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <SelectCounterLabel
                        labels={labels}
                        selectLabel={selectLabel}
                        unselectLabel={unselectLabel}
                        selectLabelValue={selectLabelValue}
                        unselectLabelValue={unselectLabelValue}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};
