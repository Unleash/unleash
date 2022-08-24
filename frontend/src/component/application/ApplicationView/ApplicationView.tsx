import { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
    Divider,
} from '@mui/material';
import {
    Extension,
    FlagRounded,
    Report,
    SvgIconComponent,
    Timeline,
} from '@mui/icons-material';
import {
    CREATE_FEATURE,
    CREATE_STRATEGY,
} from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { getTogglePath } from 'utils/routePathHelpers';
import useApplication from 'hooks/api/getters/useApplication/useApplication';
import AccessContext from 'contexts/AccessContext';
import { formatDateYMDHMS } from 'utils/formatDate';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

export const ApplicationView = () => {
    const { hasAccess } = useContext(AccessContext);
    const name = useRequiredPathParam('name');
    const { application } = useApplication(name);
    const { locationSettings } = useLocationSettings();
    const { instances, strategies, seenToggles } = application;

    const notFoundListItem = ({
        createUrl,
        name,
        permission,
    }: {
        createUrl: string;
        name: string;
        permission: string;
    }) => (
        <ConditionallyRender
            key={`not_found_conditional_${name}`}
            condition={hasAccess(permission)}
            show={
                <ListItem key={`not_found_${name}`}>
                    <ListItemAvatar>
                        <Report style={{ color: 'red' }} />
                    </ListItemAvatar>
                    <ListItemText
                        primary={<Link to={`${createUrl}`}>{name}</Link>}
                        secondary={'Missing, want to create?'}
                    />
                </ListItem>
            }
            elseShow={
                <ListItem key={`not_found_${name}`}>
                    <ListItemAvatar>
                        <Report />
                    </ListItemAvatar>
                    <ListItemText
                        primary={name}
                        secondary={`Could not find feature toggle with name ${name}`}
                    />
                </ListItem>
            }
        />
    );

    const foundListItem = ({
        viewUrl,
        name,
        description,
        Icon,
        i,
    }: {
        viewUrl: string;
        name: string;
        description: string;
        Icon: SvgIconComponent;
        i: number;
    }) => (
        <ListItem key={`found_${name}-${i}`}>
            <ListItemAvatar>
                <Icon />
            </ListItemAvatar>
            <ListItemText
                primary={
                    <Link
                        to={`${viewUrl}/${name}`}
                        style={{ wordBreak: 'break-all' }}
                    >
                        {name}
                    </Link>
                }
                secondary={description}
            />
        </ListItem>
    );
    return (
        <Grid container style={{ margin: 0 }}>
            <Grid item xl={6} md={6} xs={12}>
                <Typography variant="subtitle1" style={{ padding: '1rem 0' }}>
                    Toggles
                </Typography>
                <Divider />
                <List>
                    {seenToggles.map(
                        ({ name, description, notFound, project }, i) => (
                            <ConditionallyRender
                                key={`toggle_conditional_${name}`}
                                condition={notFound}
                                show={notFoundListItem({
                                    createUrl: `/projects/default/create-toggle?name=${name}`,
                                    name,
                                    permission: CREATE_FEATURE,
                                })}
                                elseShow={foundListItem({
                                    viewUrl: getTogglePath(project, name),
                                    name,
                                    description,
                                    Icon: FlagRounded,
                                    i,
                                })}
                            />
                        )
                    )}
                </List>
            </Grid>
            <Grid item xl={6} md={6} xs={12}>
                <Typography variant="subtitle1" style={{ padding: '1rem 0' }}>
                    Implemented strategies
                </Typography>
                <Divider />
                <List>
                    {strategies.map(
                        ({ name, description, notFound }, i: number) => (
                            <ConditionallyRender
                                key={`strategies_conditional_${name}`}
                                condition={notFound}
                                show={notFoundListItem({
                                    createUrl: '/strategies/create',
                                    name,
                                    permission: CREATE_STRATEGY,
                                })}
                                elseShow={foundListItem({
                                    viewUrl: '/strategies',
                                    name,
                                    Icon: Extension,
                                    description,
                                    i,
                                })}
                            />
                        )
                    )}
                </List>
            </Grid>
            <Grid item xl={12} md={12}>
                <Typography variant="subtitle1" style={{ padding: '1rem 0' }}>
                    {instances.length} Instances registered
                </Typography>
                <Divider />
                <List>
                    {instances.map(
                        ({
                            instanceId,
                            clientIp,
                            lastSeen,
                            sdkVersion,
                        }: {
                            instanceId: string;
                            clientIp: string;
                            lastSeen: string;
                            sdkVersion: string;
                        }) => (
                            <ListItem key={`${instanceId}`}>
                                <ListItemAvatar>
                                    <Timeline />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <ConditionallyRender
                                            key={`${instanceId}_conditional`}
                                            condition={Boolean(sdkVersion)}
                                            show={
                                                <span>
                                                    {instanceId} {sdkVersion}
                                                </span>
                                            }
                                            elseShow={<span>{instanceId}</span>}
                                        />
                                    }
                                    secondary={
                                        <span>
                                            {clientIp} last seen at{' '}
                                            <small>
                                                {formatDateYMDHMS(
                                                    lastSeen,
                                                    locationSettings.locale
                                                )}
                                            </small>
                                        </span>
                                    }
                                />
                            </ListItem>
                        )
                    )}
                </List>
            </Grid>
        </Grid>
    );
};
