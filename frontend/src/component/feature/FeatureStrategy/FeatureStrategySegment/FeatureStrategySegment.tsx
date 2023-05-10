import React from 'react';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';
import { ISegment } from 'interfaces/segment';
import {
    AutocompleteBox,
    IAutocompleteBoxOption,
} from 'component/common/AutocompleteBox/AutocompleteBox';
import { FeatureStrategySegmentList } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegmentList';
import { SegmentDocsStrategyWarning } from 'component/segments/SegmentDocs';
import { useSegmentLimits } from 'hooks/api/getters/useSegmentLimits/useSegmentLimits';
import { Divider, styled, Typography } from '@mui/material';

interface IFeatureStrategySegmentProps {
    segments: ISegment[];
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
    projectId: string;
}

const StyledDivider = styled(Divider)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

export const FeatureStrategySegment = ({
    segments: selectedSegments,
    setSegments: setSelectedSegments,
    projectId,
}: IFeatureStrategySegmentProps) => {
    const { segments: allSegments } = useSegments();
    const { strategySegmentsLimit } = useSegmentLimits();

    const atStrategySegmentsLimit: boolean = Boolean(
        strategySegmentsLimit &&
            selectedSegments.length >= strategySegmentsLimit
    );

    if (!allSegments || allSegments.length === 0) {
        return null;
    }

    const allSelectableSegments = allSegments.filter(
        ({ project }) => !project || project === projectId
    );

    const unusedSegments = allSelectableSegments.filter(segment => {
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
            <Typography component="h3" sx={{ m: 0 }} variant="h3">
                Segmentation
            </Typography>
            {atStrategySegmentsLimit && <SegmentDocsStrategyWarning />}
            <p>Add a predefined segment to constrain this feature toggle:</p>
            <AutocompleteBox
                label="Select segments"
                options={autocompleteOptions}
                onChange={onChange}
                disabled={atStrategySegmentsLimit}
            />
            <FeatureStrategySegmentList
                segments={selectedSegments}
                setSegments={setSelectedSegments}
            />
            <StyledDivider />
        </>
    );
};
