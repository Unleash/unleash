import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tooltip,
} from '@mui/material';
import { Pause, PlayArrow } from '@mui/icons-material';
import styles from 'component/common/common.module.scss';
import { Link } from 'react-router-dom';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { FeatureSchema } from 'openapi';

interface ITogglesLinkListProps {
    toggles: FeatureSchema[];
}

export const TogglesLinkList = ({ toggles }: ITogglesLinkListProps) => (
    <List style={{ textAlign: 'left' }} className={styles.truncate}>
        <ConditionallyRender
            condition={toggles.length > 0}
            show={toggles.map(({ name, description = '-', enabled }) => (
                <ListItem key={name}>
                    <ListItemAvatar>
                        <ConditionallyRender
                            condition={Boolean(enabled)}
                            show={
                                <Tooltip title="Enabled" arrow>
                                    <PlayArrow aria-hidden={false} />
                                </Tooltip>
                            }
                            elseShow={
                                <Tooltip title="Disabled" arrow>
                                    <Pause aria-hidden={false} />
                                </Tooltip>
                            }
                        />
                    </ListItemAvatar>
                    <ListItemText
                        primary={
                            <Link key={name} to={`/features/view/${name}`}>
                                {name}
                            </Link>
                        }
                        secondary={description}
                    />
                </ListItem>
            ))}
        />
    </List>
);
