import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tooltip,
} from '@mui/material';
import Pause from '@mui/icons-material/Pause';
import PlayArrow from '@mui/icons-material/PlayArrow';
import styles from 'component/common/common.module.scss';
import { Link } from 'react-router-dom';
import type { FeatureSchema } from 'openapi';

interface ITogglesLinkListProps {
    toggles: FeatureSchema[];
}

export const TogglesLinkList = ({ toggles }: ITogglesLinkListProps) => (
    <List style={{ textAlign: 'left' }} className={styles.truncate}>
        {toggles.length > 0
            ? toggles.map(({ name, description = '-', enabled }) => (
                  <ListItem key={name}>
                      <ListItemAvatar>
                          {enabled ? (
                              <Tooltip title='Enabled' arrow>
                                  <PlayArrow aria-hidden={false} />
                              </Tooltip>
                          ) : (
                              <Tooltip title='Disabled' arrow>
                                  <Pause aria-hidden={false} />
                              </Tooltip>
                          )}
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
              ))
            : null}
    </List>
);
