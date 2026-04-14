import type { FC } from 'react';
import {
    Box,
    Divider,
    Link,
    List,
    ListItem,
    Typography,
    styled,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const SidebarContainer = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.sidebar,
    padding: theme.spacing(6),
    minWidth: '300px',
    maxWidth: '350px',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
}));

const SidebarText = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.contrastText,
    fontSize: theme.typography.body2.fontSize,
}));

const SectionTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: theme.palette.primary.contrastText,
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing(1),
}));

const IconStyle = {
    fontSize: '1.2rem',
};

export const InfoSidebar: FC = () => {
    return (
        <SidebarContainer>
            <Box>
                <SectionTitle>
                    <InfoOutlinedIcon sx={IconStyle} />
                    What are impact metrics?
                </SectionTitle>
                <SidebarText>
                    Impact metrics are numerical measurements that track the
                    impact of your feature flags. They help you understand if a
                    feature is performing as expected and can be set up to
                    trigger automated safeguards when issues arise.
                </SidebarText>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

            <Box>
                <SectionTitle>
                    <TipsAndUpdatesOutlinedIcon sx={IconStyle} />
                    Best practices
                </SectionTitle>
                <List dense disablePadding sx={{ pl: 2 }}>
                    <ListItem
                        disableGutters
                        sx={{
                            display: 'list-item',
                            listStyleType: 'disc',
                            p: 0,
                        }}
                    >
                        <SidebarText>
                            Use descriptive, specific names that indicate what
                            you're measuring
                        </SidebarText>
                    </ListItem>
                    <ListItem
                        disableGutters
                        sx={{
                            display: 'list-item',
                            listStyleType: 'disc',
                            p: 0,
                        }}
                    >
                        <SidebarText>
                            Choose the metric type that matches how the value
                            changes over time
                        </SidebarText>
                    </ListItem>
                    <ListItem
                        disableGutters
                        sx={{
                            display: 'list-item',
                            listStyleType: 'disc',
                            p: 0,
                        }}
                    >
                        <SidebarText>
                            Track both positive indicators (success) and
                            negative indicators (errors)
                        </SidebarText>
                    </ListItem>
                </List>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

            <Link
                href='https://docs.getunleash.io/reference/impact-metrics'
                target='_blank'
                rel='noopener noreferrer'
                sx={{
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: 'body2.fontSize',
                }}
            >
                View full documentation
                <OpenInNewIcon sx={{ fontSize: '1rem' }} />
            </Link>
        </SidebarContainer>
    );
};
