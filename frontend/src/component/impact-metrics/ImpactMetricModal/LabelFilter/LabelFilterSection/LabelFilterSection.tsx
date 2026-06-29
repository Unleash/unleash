import type { FC } from 'react';
import { Box, Typography, Chip, styled } from '@mui/material';
import { LabelFilterItem } from './LabelFilterItem/LabelFilterItem.tsx';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    width: '100%',
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledGrid = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: theme.spacing(2),
    flexGrow: 1,
}));

const StyledGridItem = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
});

const StyledTitle = styled(Typography)({
    lineHeight: 1.5,
    height: '24px',
});

const StyledClearAll = styled(Chip)(({ theme }) => ({
    position: 'relative',
    height: '20px',
    margin: theme.spacing(-1, 0),
}));

export const LabelFilterSection: FC<{
    title: string;
    labels: [string, string[]][];
    labelSelectors: Record<string, string[]>;
    onLabelChange: (labelKey: string, values: string[]) => void;
    onAllToggle: (labelKey: string, checked: boolean) => void;
    onChange: (labels: Record<string, string[]>) => void;
}> = ({
    title,
    labels,
    labelSelectors,
    onLabelChange,
    onAllToggle,
    onChange,
}) => {
    const labelKeys = labels.map(([key]) => key);

    const hasSelections = labelKeys.some((k) => labelSelectors[k]);

    const clearSection = () => {
        const newLabels: Record<string, string[]> = {};
        Object.entries(labelSelectors).forEach(([key, val]) => {
            if (!labelKeys.includes(key)) {
                newLabels[key] = val;
            }
        });
        onChange(newLabels);
    };

    return (
        <StyledContainer>
            <StyledHeader>
                <StyledTitle variant='subtitle2'>{title}</StyledTitle>
                {hasSelections && (
                    <StyledClearAll
                        label='Clear all'
                        size='small'
                        variant='outlined'
                        onClick={clearSection}
                    />
                )}
            </StyledHeader>
            <StyledGrid>
                {labels.map(([labelKey, values]) => {
                    const currentSelection = labelSelectors[labelKey] || [];
                    return (
                        <StyledGridItem key={labelKey}>
                            <LabelFilterItem
                                labelKey={labelKey}
                                options={values}
                                value={currentSelection}
                                onChange={(newValues) =>
                                    onLabelChange(labelKey, newValues)
                                }
                                handleAllToggle={onAllToggle}
                            />
                        </StyledGridItem>
                    );
                })}
            </StyledGrid>
        </StyledContainer>
    );
};
