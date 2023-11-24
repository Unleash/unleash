import {
    List,
    ListItemText,
    Box,
    Checkbox,
    ListItem,
    ListItemIcon,
    Typography,
} from '@mui/material';
import {
    useEffect,
    useRef,
    useState,
    type ComponentProps,
    type FC,
    Fragment,
} from 'react';
import {
    StyledDropdown,
    StyledListItem,
    StyledPopover,
} from './FilterItem.styles';
import { FilterItemChip } from './FilterItemChip/FilterItemChip';
import { FilterItemSearch } from './FilterItemSearch/FilterItemSearch';
import { ConditionallyRender } from '../ConditionallyRender/ConditionallyRender';
import { LabelOutlined } from '@mui/icons-material';

interface IFilterItemProps {
    label: string;
    options: Array<{ label: string; value: string; category?: string }>;
    icon?: ComponentProps<typeof FilterItemChip>['icon'];
    withSearch?: boolean;
}

const singularOperators = ['IS', 'IS_NOT'];
const pluralOperators = ['IS_IN', 'IS_NOT_IN'];

const Option: FC<
    IFilterItemProps['options'][number] & {
        onClick: (value: string) => void;
        checked?: boolean;
        isIndented?: boolean;
    }
> = ({ onClick, label, value, checked = false ,isIndented}) => {
    const labelId = `checkbox-list-label-${value}`;

    return (
        <StyledListItem
            key={value}
            dense
            disablePadding
            onClick={(event) => {
                event.stopPropagation();
                onClick(value);
            }}
            sx={{
                paddingLeft: isIndented ? 3.5 : 1,
            }}
        >
            <Checkbox
                edge='start'
                checked={checked}
                inputProps={{
                    'aria-labelledby': labelId,
                }}
                size='small'
            />
            <ListItemText id={labelId} primary={label} />
        </StyledListItem>
    );
};

const Category: FC<{ children?: string }> = ({ children }) => (<ListItem
    dense
    disablePadding
>
    <ListItemIcon
        sx={{
            minWidth: 'auto',
            marginRight: 1,
        }}
    >
        <LabelOutlined fontSize='small' />
    </ListItemIcon>
    <ListItemText>
        <Typography
            variant='body2'
            sx={(theme) => ({
                fontWeight:
                    theme.typography
                        .fontWeightBold,
            })}
        >
            {children}
        </Typography>
    </ListItemText>
</ListItem>);

export const FilterItem: FC<IFilterItemProps> = ({
    label,
    options,
    icon,
    withSearch = false,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const categories = options.some((option) => option.category)
        ? [...new Set(options.map((option) => option.category))].filter(Boolean)
        : [];
    const [selectedOptions, setSelectedOptions] = useState<typeof options>([]);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [searchText, setSearchText] = useState('');
    const currentOperators =
        selectedOptions?.length > 1 ? pluralOperators : singularOperators;
    const [operator, setOperator] = useState(currentOperators[0]);

    const onClick = () => {
        setAnchorEl(ref.current);
    };

    const onClose = () => {
        setAnchorEl(null);
    };

    const onDelete = () => {
        setSelectedOptions([]);
        onClose();
    };

    const handleToggle = (value: string) => () => {
        if (
            selectedOptions?.some(
                (selectedOption) => selectedOption.value === value,
            )
        ) {
            setSelectedOptions(
                selectedOptions?.filter(
                    (selectedOption) => selectedOption.value !== value,
                ),
            );
        } else {
            setSelectedOptions([
                ...(selectedOptions ?? []),
                options.find((option) => option.value === value) ?? {
                    label: '',
                    value: '',
                },
            ]);
        }
    };

    const isChecked = (value: string) =>
        selectedOptions?.some(
            (selectedOption) => selectedOption.value === value,
        ) ?? false;

    useEffect(() => {
        if (!currentOperators.includes(operator)) {
            setOperator(currentOperators[0]);
        }
    }, [currentOperators, operator]);

    return (
        <>
            <Box ref={ref}>
                <FilterItemChip
                    label={label}
                    selectedOptions={selectedOptions?.map(
                        (option) => `${option.category ? `${option.category}:` : ''}${option?.label}`,
                    )}
                    onDelete={onDelete}
                    onClick={onClick}
                    operator={operator}
                    operatorOptions={currentOperators}
                    onChangeOperator={setOperator}
                    icon={icon}
                />
            </Box>
            <StyledPopover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={onClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <StyledDropdown>
                    <ConditionallyRender
                        condition={withSearch}
                        show={
                            <FilterItemSearch
                                value={searchText}
                                setValue={setSearchText}
                            />
                        }
                    />
                    <List disablePadding>
                        <ConditionallyRender
                            condition={categories.length > 0}
                            show={() => (
                                <>
                                    {categories.map((category) => (
                                        <Fragment key={category}>
                                            <Category>{category}</Category>
                                            {options
                                                ?.filter((option) =>
                                                    option.label
                                                        .toLowerCase()
                                                        .includes(
                                                            searchText.toLowerCase(),
                                                        ) && option.category === category,
                                                )
                                                .map((option) => (
                                                    <Option
                                                        {...option}
                                                        onClick={handleToggle(
                                                            option.value,
                                                        )}
                                                        checked={isChecked(
                                                            option.value,
                                                        )}
                                                        isIndented
                                                    />
                                                ))}
                                        </Fragment>
                                    ))}
                                </>
                            )}
                        />
                        <ConditionallyRender
                            condition={
                                categories.length > 0 &&
                                options.some((option) => !option.category)
                            }
                            show={() => (
                                <Category />
                            )}
                        />
                        {options
                            ?.filter(
                                (option) =>
                                    option.label
                                        .toLowerCase()
                                        .includes(searchText.toLowerCase()) &&
                                    (categories.length > 0
                                        ? !option.category
                                        : true),
                            )
                            .map((option) =>
                            <Option
                                {...option}
                                onClick={handleToggle(
                                    option.value,
                                )}
                                checked={isChecked(
                                    option.value,
                                )}
                                isIndented={categories.length > 0}
                            />)}
                    </List>
                </StyledDropdown>
            </StyledPopover>
        </>
    );
};
