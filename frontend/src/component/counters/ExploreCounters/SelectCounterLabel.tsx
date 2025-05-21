import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
} from '@mui/material';
import { useState } from 'react';

const getLabelNames = (labels: Record<string, string[]>) => {
    return Object.keys(labels);
};

const getLabelValues = (label: string, labels: Record<string, string[]>) => {
    return labels[label];
};

export const SelectCounterLabel = ({
    labels,
    unselectLabel,
    selectLabel,
    unselectLabelValue,
    selectLabelValue,
}: {
    labels: Record<string, string[]> | undefined;
    unselectLabel: (label: string) => void;
    selectLabel: (label: string) => void;
    unselectLabelValue: (labelValue: string) => void;
    selectLabelValue: (labelValue: string) => void;
}) => {
    const [label, setLabel] = useState<string | undefined>(undefined);
    const [labelValue, setLabelValue] = useState<string | undefined>(undefined);
    const labelChanged = (event: SelectChangeEvent<string>) => {
        unselectLabel(label as string);
        selectLabel(event.target.value as string);
        const selectedLabel = event.target.value as string;
        setLabel(selectedLabel);
    };
    const labelValueChanged = (event: SelectChangeEvent<string>) => {
        unselectLabelValue(labelValue as string);
        const newValue = event.target.value as string;
        if (newValue === '') {
            setLabelValue(undefined);
            return;
        }
        selectLabelValue(newValue);
        setLabelValue(newValue);
    };
    return (
        <>
            <FormControl>
                <InputLabel id='labels-label' size='small'>
                    Label
                </InputLabel>
                <Select
                    label='Label'
                    labelId='labels-label'
                    id='label-select'
                    value={label}
                    onChange={labelChanged}
                    variant='outlined'
                    size='small'
                    sx={{ width: 200, maxWidth: '100%' }}
                >
                    {labels
                        ? getLabelNames(labels)?.map((option) => (
                              <MenuItem key={option} value={option}>
                                  {option}
                              </MenuItem>
                          ))
                        : null}
                </Select>
            </FormControl>
            {label ? (
                <FormControl>
                    <InputLabel id='label-value-label' size='small'>
                        Label value
                    </InputLabel>
                    <Select
                        label='Label value'
                        labelId='label-value-label'
                        id='label-value-select'
                        value={labelValue}
                        onChange={labelValueChanged}
                        variant='outlined'
                        size='small'
                        sx={{ width: 200, maxWidth: '100%' }}
                    >
                        <MenuItem key='all' value=''>
                            All
                        </MenuItem>
                        {labels
                            ? getLabelValues(label, labels)?.map((option) => (
                                  <MenuItem
                                      key={option}
                                      value={`${label}::${option}`}
                                  >
                                      {option}
                                  </MenuItem>
                              ))
                            : null}
                    </Select>
                </FormControl>
            ) : null}
        </>
    );
};
