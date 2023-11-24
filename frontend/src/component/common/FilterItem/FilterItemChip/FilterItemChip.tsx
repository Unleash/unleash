import { ComponentProps, FC } from 'react';
import {} from '../FilterItem.styles';
import {
    ArrowDropDown,
    Close,
    DonutLarge,
    LabelOutlined,
    TopicOutlined,
} from '@mui/icons-material';
import { ConditionallyRender } from '../../ConditionallyRender/ConditionallyRender';
import { Chip, IconButton, styled } from '@mui/material';
import { FilterItemOperator } from './FilterItemOperator/FilterItemOperator';

const StyledChip = styled(
    ({
        isActive,
        ...props
    }: { isActive: boolean } & ComponentProps<typeof Chip>) => (
        <Chip {...props} />
    ),
)(({ theme, isActive = false }) => ({
    borderRadius: `${theme.shape.borderRadius}px`,
    padding: 0,
    margin: theme.spacing(0, 0, 1, 0),
    fontSize: theme.typography.body2.fontSize,
    ...(isActive
        ? {
              backgroundColor: theme.palette.secondary.light,
          }
        : {}),
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

const StyledOptions = styled('span')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(-1.25),
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

interface IFilterItemChipProps {
    label: string;
    selectedOptions?: string[];
    operatorOptions: string[];
    operator: string;
    icon?: 'project' | 'segment' | 'tag';
    onChangeOperator: (value: string) => void;
    onClick?: () => void;
    onDelete?: () => void;
}

const getIcon = (icon?: IFilterItemChipProps['icon']) => {
    switch (icon) {
        case 'project':
            return (
                <StyledCategoryIconWrapper>
                    <TopicOutlined fontSize='inherit' />
                </StyledCategoryIconWrapper>
            );
        case 'segment':
            return (
                <StyledCategoryIconWrapper>
                    <DonutLarge fontSize='inherit' />
                </StyledCategoryIconWrapper>
            );
        case 'tag':
            return (
                <StyledCategoryIconWrapper>
                    <LabelOutlined fontSize='inherit' />
                </StyledCategoryIconWrapper>
            );
        default:
            return null;
    }
};

export const FilterItemChip: FC<IFilterItemChipProps> = ({
    label,
    selectedOptions = [],
    operatorOptions,
    operator,
    icon,
    onChangeOperator,
    onClick,
    onDelete,
}) => {
    const hasSelectedOptions = selectedOptions.length > 0;

    return (
        <StyledChip
            isActive={hasSelectedOptions}
            label={
                <StyledLabel>
                    {getIcon(icon)}
                    {label}
                    <ConditionallyRender
                        condition={!hasSelectedOptions}
                        show={() => <Arrow />}
                        elseShow={() => (
                            <>
                                <FilterItemOperator
                                    options={operatorOptions}
                                    value={operator}
                                    onChange={onChangeOperator}
                                />
                                <StyledOptions>
                                    {selectedOptions.join(', ')}
                                </StyledOptions>
                            </>
                        )}
                    />
                    <ConditionallyRender
                        condition={Boolean(onDelete && hasSelectedOptions)}
                        show={() => (
                            <StyledIconButton
                                aria-label='delete'
                                color='primary'
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    onDelete?.();
                                }}
                                size='small'
                            >
                                <Close fontSize='inherit' color='action' />
                            </StyledIconButton>
                        )}
                    />
                </StyledLabel>
            }
            color='primary'
            variant='outlined'
            onClick={onClick}
        />
    );
};
