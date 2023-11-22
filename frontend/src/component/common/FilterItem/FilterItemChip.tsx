import { FC } from 'react';
import {} from './FilterItem.styles';
import { ArrowDropDown, Close, TopicOutlined } from '@mui/icons-material';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import { Chip, styled } from '@mui/material';

interface IFilterItemChipProps {
    label: string;
    selectedOptions?: string[];
    onClick?: () => void;
    onDelete?: () => void;
}

const StyledChip = styled(Chip)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadius}px`,
    padding: 0,
    margin: theme.spacing(0, 0, 1, 0),
    fontSize: theme.typography.body2.fontSize,
}));

const StyledLabel = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: theme.typography.fontWeightBold,
}));

const StyledCategoryIconWrapper = styled('div')(({ theme }) => ({
    marginRight: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.typography.h2.fontSize,
}));

const StyledOperator = styled('button')(({ theme }) => ({
    borderRadius: 0,
    border: 'none',
    cursor: 'pointer',
    color: theme.palette.text.disabled,
    fontSize: theme.typography.body2.fontSize,
    padding: theme.spacing(0, 0.75),
    margin: theme.spacing(0, 0.75),
    // background: 'blue',
    height: theme.spacing(3.75),
    display: 'flex',
    alignItems: 'center',
}));

const StyledOptions = styled('span')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
}));

const Arrow = () => (
    <ArrowDropDown
        fontSize='small'
        color='action'
        sx={(theme) => ({
            marginRight: theme.spacing(-1),
            marginLeft: theme.spacing(0.5),
        })}
    />
);

export const FilterItemChip: FC<IFilterItemChipProps> = ({
    label,
    selectedOptions = [],
    onClick,
    onDelete,
}) => {
    const hasSelectedOptions = selectedOptions.length > 0;

    return (
        <StyledChip
            label={
                <StyledLabel>
                    <StyledCategoryIconWrapper>
                        <TopicOutlined fontSize='inherit' />
                    </StyledCategoryIconWrapper>
                    {label}
                    <ConditionallyRender
                        condition={!hasSelectedOptions}
                        show={() => <Arrow />}
                        elseShow={() => (
                            <>
                                <StyledOperator>is in</StyledOperator>
                                <StyledOptions>
                                    {selectedOptions.join(', ')}
                                </StyledOptions>
                            </>
                        )}
                    />
                </StyledLabel>
            }
            onDelete={hasSelectedOptions ? onDelete : undefined}
            color='primary'
            variant='outlined'
            onClick={onClick}
            deleteIcon={<Close fontSize='inherit' />}
        />
    );
};
