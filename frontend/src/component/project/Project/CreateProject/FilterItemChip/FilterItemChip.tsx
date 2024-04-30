import type { FC, ReactNode } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Button, styled } from '@mui/material';
import CloudCircle from '@mui/icons-material/CloudCircle';

const StyledLabel = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledOptions = styled('button')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    maxWidth: '200px',
    [theme.breakpoints.up('md')]: {
        maxWidth: '800px',
    },
    border: 'none',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    height: theme.spacing(3),
}));

interface IFilterItemChipProps {
    label: ReactNode;
    selectedDisplayOptions?: string[];
    onClick?: () => void;
}

export const FilterItemChip: FC<IFilterItemChipProps> = ({
    label,
    selectedDisplayOptions = [],
    onClick,
}) => {
    const hasSelectedOptions = selectedDisplayOptions.length > 0;
    const maxExplicitOptions = 2;
    const explicitOptions = selectedDisplayOptions.slice(0, maxExplicitOptions);
    const remainingOptions = selectedDisplayOptions.length - maxExplicitOptions;

    return (
        <Button
            variant='outlined'
            color='primary'
            startIcon={<CloudCircle />}
            onClick={onClick}
        >
            <StyledLabel>
                {label}
                <ConditionallyRender
                    condition={!hasSelectedOptions}
                    show={() => <>?</>} // todo: figure out what goes here
                    elseShow={() => (
                        <StyledOptions>
                            {explicitOptions.join(', ')}
                            {remainingOptions > 0
                                ? ` +${remainingOptions}`
                                : ''}
                        </StyledOptions>
                    )}
                />
            </StyledLabel>
        </Button>
    );
};
