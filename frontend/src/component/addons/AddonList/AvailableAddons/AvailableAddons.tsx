import { ReactElement } from 'react';
import PageContent from 'component/common/PageContent/PageContent';
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
} from '@material-ui/core';
import { CREATE_ADDON } from 'component/providers/AccessProvider/permissions';
import { useHistory } from 'react-router-dom';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';

interface IProvider {
    name: string;
    displayName: string;
    description: string;
    documentationUrl: string;
    parameters: object[];
    events: string[];
}

interface IAvailableAddonsProps {
    getAddonIcon: (name: string) => ReactElement;
    providers: IProvider[];
}

export const AvailableAddons = ({
    providers,
    getAddonIcon,
}: IAvailableAddonsProps) => {
    const history = useHistory();

    const renderProvider = (provider: IProvider) => (
        <ListItem key={provider.name}>
            <ListItemAvatar>{getAddonIcon(provider.name)}</ListItemAvatar>
            <ListItemText
                primary={provider.displayName}
                secondary={provider.description}
            />
            <ListItemSecondaryAction>
                <PermissionButton
                    permission={CREATE_ADDON}
                    onClick={() =>
                        history.push(`/addons/create/${provider.name}`)
                    }
                >
                    Configure
                </PermissionButton>
            </ListItemSecondaryAction>
        </ListItem>
    );
    return (
        <PageContent headerContent="Available addons">
            <List>
                {providers.map((provider: IProvider) =>
                    renderProvider(provider)
                )}
            </List>
        </PageContent>
    );
};
