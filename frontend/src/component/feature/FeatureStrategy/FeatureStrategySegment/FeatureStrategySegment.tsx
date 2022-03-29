import React from 'react';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { ISegment } from 'interfaces/segment';
import {
    AutocompleteBox,
    IAutocompleteBoxOption,
} from 'component/common/AutocompleteBox/AutocompleteBox';
import { FeatureStrategySegmentList } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegmentList';
import { useStyles } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegment.styles';

interface IFeatureStrategySegmentProps {
    segments: ISegment[];
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
}

export const FeatureStrategySegment = ({
    segments: selectedSegments,
    setSegments: setSelectedSegments,
}: IFeatureStrategySegmentProps) => {
    const { segments: allSegments } = useSegments();
    const styles = useStyles();

    if (!allSegments || allSegments.length === 0) {
        return null;
    }

    const unusedSegments = allSegments.filter(segment => {
        return !selectedSegments.find(selected => selected.id === segment.id);
    });

    const autocompleteOptions = unusedSegments.map(segment => ({
        value: String(segment.id),
        label: segment.name,
    }));

    const onChange = ([option]: IAutocompleteBoxOption[]) => {
        const selectedSegment = allSegments.find(segment => {
            return String(segment.id) === option.value;
        });
        if (selectedSegment) {
            setSelectedSegments(prev => [...prev, selectedSegment]);
        }
    };

    return (
        <>
            <h3 className={styles.title}>Segmentation</h3>
            <p>Add a predefined segment to constrain this feature toggle:</p>
            <AutocompleteBox
                label="Select segments"
                options={autocompleteOptions}
                onChange={onChange}
            />
            <FeatureStrategySegmentList
                segments={selectedSegments}
                setSegments={setSelectedSegments}
            />
        </>
    );
};
