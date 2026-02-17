import type React from 'react';
import type { ISegment } from 'interfaces/segment';
import {
    AutocompleteBox,
    type IAutocompleteBoxOption,
} from 'component/common/AutocompleteBox/AutocompleteBox';
import { FeatureStrategySegmentList } from 'component/feature/FeatureStrategy/FeatureStrategySegment/FeatureStrategySegmentList';
import { SegmentDocsStrategyWarning } from 'component/segments/SegmentDocs';
import { useSegmentLimits } from 'hooks/api/getters/useSegmentLimits/useSegmentLimits';
import { Box, styled, Typography } from '@mui/material';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { RecentlyUsedSegments } from './RecentlyUsedSegments/RecentlyUsedSegments.tsx';

interface IFeatureStrategySegmentProps {
    segments: ISegment[];
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
    availableSegments: ISegment[];
}

const StyledHelpIconBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

export const FeatureStrategySegment = ({
    segments: selectedSegments,
    setSegments: setSelectedSegments,
    availableSegments,
}: IFeatureStrategySegmentProps) => {
    const { strategySegmentsLimit } = useSegmentLimits();

    const atStrategySegmentsLimit: boolean = Boolean(
        strategySegmentsLimit &&
            selectedSegments.length >= strategySegmentsLimit,
    );

    const unusedSegments = availableSegments.filter((segment) => {
        return !selectedSegments.find((selected) => selected.id === segment.id);
    });

    const autocompleteOptions = unusedSegments.map((segment) => ({
        value: String(segment.id),
        label: segment.name,
    }));

    const onChange = ([option]: IAutocompleteBoxOption[]) => {
        const selectedSegment = availableSegments.find((segment) => {
            return String(segment.id) === option.value;
        });
        if (selectedSegment) {
            setSelectedSegments((prev) => [...prev, selectedSegment]);
        }
    };

    return (
        <>
            <StyledHelpIconBox>
                <Typography>Segments</Typography>
                <HelpIcon
                    htmlTooltip
                    tooltip={
                        <Box>
                            <Typography variant='body2'>
                                Segments are reusable sets of constraints that
                                can be defined once and reused across feature
                                toggle configurations. You can create a segment
                                on the global or the project level. Read more
                                about segments{' '}
                                <a
                                    href='https://docs.getunleash.io/concepts/segments'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    here
                                </a>
                            </Typography>
                        </Box>
                    }
                />
            </StyledHelpIconBox>

            {atStrategySegmentsLimit && <SegmentDocsStrategyWarning />}
            <AutocompleteBox
                label='Select segments'
                options={autocompleteOptions}
                onChange={onChange}
                disabled={atStrategySegmentsLimit}
                icon={null}
                width={'175px'}
            />
            <FeatureStrategySegmentList
                segments={selectedSegments}
                setSegments={setSelectedSegments}
            />
            <RecentlyUsedSegments
                setSegments={setSelectedSegments}
                segments={selectedSegments}
            />
        </>
    );
};
