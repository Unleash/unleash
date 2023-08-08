import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { VFC } from 'react';
import { adminGroups, adminRoutes } from './adminRoutes';
import { INavigationMenuItem } from 'interfaces/route';
import { Box, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const routeGroups = adminRoutes.reduce((acc, route) => {
    const group = route.group || 'other';

    const index = acc.findIndex(item => item.name === group);
    if (index === -1) {
        acc.push({
            name: group,
            description: adminGroups[group] || 'Other',
            items: [route],
        });

        return acc;
    }

    acc[index].items.push(route);

    return acc;
}, [] as Array<{ name: string; description: string; items: INavigationMenuItem[] }>);

export const AdminIndex: VFC = () => {
    return (
        <PageContent header={<PageHeader title="Manage Unleash" />}>
            {routeGroups.map(group => (
                <Box
                    key={group.name}
                    sx={theme => ({ marginBottom: theme.spacing(2) })}
                >
                    <Typography variant="h2">{group.description}</Typography>
                    <ul>
                        {group.items.map(route => (
                            <li key={route.path}>
                                <Link component={RouterLink} to={route.path}>
                                    {route.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Box>
            ))}
        </PageContent>
    );
};
