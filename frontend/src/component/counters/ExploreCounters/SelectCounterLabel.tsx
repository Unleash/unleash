import { SelectField } from 'component/common/SelectField/SelectField';
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

    const labelChanged = (selectedLabel: string) => {
        unselectLabel(label as string);
        selectLabel(selectedLabel);
        setLabel(selectedLabel);
    };

    const labelValueChanged = (newValue: string) => {
        unselectLabelValue(labelValue as string);
        if (newValue === '') {
            setLabelValue(undefined);
            return;
        }
        selectLabelValue(newValue);
        setLabelValue(newValue);
    };

    return (
        <>
            <SelectField
                label='Label'
                id='label-select'
                value={label ?? ''}
                onChange={labelChanged}
                options={
                    labels
                        ? getLabelNames(labels).map((option) => ({
                              key: option,
                              label: option,
                          }))
                        : []
                }
                size='small'
                sx={{ width: 200, maxWidth: '100%' }}
            />
            {label ? (
                <SelectField
                    label='Label value'
                    id='label-value-select'
                    value={labelValue ?? ''}
                    onChange={labelValueChanged}
                    options={[
                        { key: '', label: 'All' },
                        ...(labels
                            ? (getLabelValues(label, labels) ?? []).map(
                                  (option) => ({
                                      key: `${label}::${option}`,
                                      label: option,
                                  }),
                              )
                            : []),
                    ]}
                    size='small'
                    sx={{ width: 200, maxWidth: '100%' }}
                />
            ) : null}
        </>
    );
};
