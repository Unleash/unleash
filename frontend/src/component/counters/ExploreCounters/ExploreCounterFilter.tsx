import Grid from '@mui/material/Grid';
import { SelectCounterLabel } from './SelectCounterLabel.js';
import { SelectField } from 'component/common/SelectField/SelectField.js';

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
    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Grid container spacing={2}>
                    <SelectField
                        label='Counter'
                        id='counter-select'
                        value={counter ?? ''}
                        onChange={setCounter}
                        options={(counterNames ?? []).map((option) => ({
                            key: option,
                            label: option,
                        }))}
                        size='small'
                        sx={{ width: 200, maxWidth: '100%' }}
                    />
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
