import {
    Icon,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    styled,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import type { Theme } from '@mui/material/styles/createTheme';

const listItemButtonStyle = (theme: Theme) => ({
    borderRadius: theme.spacing(0.5),
    borderLeft: `${theme.spacing(0.5)} solid transparent`,
    '&.Mui-selected': {
        borderLeft: `${theme.spacing(0.5)} solid ${theme.palette.primary.main}`,
    },
});

const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.bodySize,
    padding: theme.spacing(0, 3),
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
    minWidth: theme.spacing(4),
    margin: theme.spacing(0.25, 0),
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
    margin: 0,
}));

export interface CommandResultGroupItem {
    name: string;
    link: string;
}

interface CommandResultGroupProps {
    icon: string;
    groupName: string;
    items: CommandResultGroupItem[];
}

export const CommandResultGroup = ({
    icon,
    groupName,
    items,
}: CommandResultGroupProps) => {
    const slicedItems = items.slice(0, 3);

    if (items.length === 0) {
        return;
    }
    return (
        <>
            <StyledTypography color='textSecondary'>
                {groupName}
            </StyledTypography>
            <List>
                {slicedItems.map((item, index) => (
                    <ListItemButton
                        key={`command-result-group-${groupName}-${index}`}
                        dense={true}
                        component={Link}
                        to={item.link}
                        sx={listItemButtonStyle}
                    >
                        <StyledListItemIcon>
                            <Icon>{icon}</Icon>
                        </StyledListItemIcon>
                        <StyledListItemText>
                            <Typography>{item.name}</Typography>
                        </StyledListItemText>
                    </ListItemButton>
                ))}
            </List>
        </>
    );
};
