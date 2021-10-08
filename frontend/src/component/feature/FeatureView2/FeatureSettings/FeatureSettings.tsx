import { useState } from 'react';
import PageContent from '../../../common/PageContent';
import { useStyles } from './FeatureSettings.styles';

import { List, ListItem } from '@material-ui/core';
import ConditionallyRender from '../../../common/ConditionallyRender';
import FeatureSettingsMetadata from './FeatureSettingsMetadata/FeatureSettingsMetadata';
import FeatureSettingsProject from './FeatureSettingsProject/FeatureSettingsProject';

const METADATA = 'metadata';
const PROJECT = 'project';

const FeatureSettings = () => {
    const styles = useStyles();

    const [settings, setSettings] = useState(METADATA);

    return (
        <PageContent headerContent="Settings" bodyClass={styles.bodyContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.listContainer}>
                    <List className={styles.list}>
                        <ListItem
                            className={styles.listItem}
                            button
                            onClick={() => setSettings(METADATA)}
                        >
                            Metadata
                        </ListItem>
                        <ListItem
                            className={styles.listItem}
                            button
                            onClick={() => setSettings(PROJECT)}
                        >
                            Project
                        </ListItem>
                    </List>
                </div>

                <div className={styles.innerBodyContainer}>
                    <ConditionallyRender
                        condition={settings === METADATA}
                        show={<FeatureSettingsMetadata />}
                    />
                    <ConditionallyRender
                        condition={settings === PROJECT}
                        show={<FeatureSettingsProject />}
                    />
                </div>
            </div>
        </PageContent>
    );
};

export default FeatureSettings;
