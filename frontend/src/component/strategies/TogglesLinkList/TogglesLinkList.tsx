import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tooltip,
} from '@material-ui/core';
import { Pause, PlayArrow } from '@material-ui/icons';
import styles from 'component/common/common.module.scss';
import { Link } from 'react-router-dom';
import ConditionallyRender from 'component/common/ConditionallyRender';
import { IFeatureToggle } from 'interfaces/featureToggle';

interface ITogglesLinkListProps {
    toggles: IFeatureToggle[];
}

export const TogglesLinkList = ({ toggles }: ITogglesLinkListProps) => (
    <List style={{ textAlign: 'left' }} className={styles.truncate}>
        <ConditionallyRender
            condition={toggles.length > 0}
            show={
                <>
                    {toggles.map(({ name, description = '-', enabled }) => (
                        <ListItem key={name}>
                            <Tooltip title={enabled ? 'Enabled' : 'Disabled'}>
                                <ListItemAvatar>
                                    {enabled ? <PlayArrow /> : <Pause />}
                                </ListItemAvatar>
                            </Tooltip>
                            <ListItemText
                                primary={
                                    <Link
                                        key={name}
                                        to={`/features/view/${name}`}
                                    >
                                        {name}
                                    </Link>
                                }
                                secondary={description}
                            />
                        </ListItem>
                    ))}
                </>
            }
        />
    </List>
);
