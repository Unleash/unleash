import { ArrowDropDown, TopicOutlined } from '@mui/icons-material';
import {
    Chip,
    Popover,
    List,
    ListItem,
    Checkbox,
    ListItemText,
    TextField,
} from '@mui/material';
import { styled } from '@mui/material';
import { FC, useRef, useState } from 'react';

interface IFilterItemProps {
    label: string;
}

const StyledChip = styled(Chip)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadius}px`,
    padding: 0,
    margin: 0,
}));

const StyledLabel = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const StyledIcon = styled('div')(({ theme }) => ({
    marginRight: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    fontSize: theme.typography.h2.fontSize,
}));

const StyledDropdown = styled('div')(({ theme }) => ({
    padding: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
    paddingLeft: theme.spacing(1),
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
    padding: theme.spacing(1, 1, 1, 1.5),
}));

export const FilterItem: FC<IFilterItemProps> = ({ label }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const [searchText, setSearchText] = useState('');

    const options = ['Option 1', 'Option 2', 'Option 3']; // replace with your options

    const handleClick = () => {
        setAnchorEl(ref.current);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleToggle = (value: string) => () => {
        const currentIndex = selectedOptions.indexOf(value);
        const newChecked = [...selectedOptions];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedOptions(newChecked);
    };

    return (
        <>
            <StyledChip
                ref={ref}
                label={
                    <StyledLabel>
                        <StyledIcon>
                            <TopicOutlined fontSize='inherit' />
                        </StyledIcon>
                        {label}

                        <ArrowDropDown fontSize='small' />
                    </StyledLabel>
                }
                color='primary'
                variant='outlined'
                onClick={handleClick}
            />
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <StyledDropdown>
                    <TextField
                        variant='outlined'
                        size='small'
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        placeholder='Search'
                    />
                    <List>
                        {options
                            .filter((option) =>
                                option
                                    .toLowerCase()
                                    .includes(searchText.toLowerCase()),
                            )
                            .map((option) => {
                                const labelId = `checkbox-list-label-${option}`;

                                return (
                                    <StyledListItem
                                        key={option}
                                        dense
                                        disablePadding
                                        onClick={handleToggle(option)}
                                    >
                                        <StyledCheckbox
                                            edge='start'
                                            checked={
                                                selectedOptions.indexOf(
                                                    option,
                                                ) !== -1
                                            }
                                            tabIndex={-1}
                                            inputProps={{
                                                'aria-labelledby': labelId,
                                            }}
                                            size='small'
                                            disableRipple
                                        />
                                        <ListItemText
                                            id={labelId}
                                            primary={option}
                                        />
                                    </StyledListItem>
                                );
                            })}
                    </List>
                </StyledDropdown>
            </Popover>
        </>
    );
};
