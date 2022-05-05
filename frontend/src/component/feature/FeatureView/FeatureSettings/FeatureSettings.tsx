import { useState } from 'react';
import PageContent from 'component/common/PageContent';
import { useStyles } from './FeatureSettings.styles';
import { List, ListItem } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import FeatureSettingsProject from './FeatureSettingsProject/FeatureSettingsProject';
import { FeatureSettingsInformation } from './FeatureSettingsInformation/FeatureSettingsInformation';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

const METADATA = 'metadata';
const PROJECT = 'project';

export const FeatureSettings = () => {
    const { classes: styles } = useStyles();
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const [settings, setSettings] = useState(METADATA);

    return (
        <PageContent headerContent="Settings" bodyClass={styles.bodyContainer}>
            <div className={styles.innerContainer}>
                <div className={styles.listContainer}>
                    <List>
                        <ListItem
                            key={0}
                            className={styles.listItem}
                            button
                            onClick={() => setSettings(METADATA)}
                            selected={settings === METADATA}
                        >
                            Metadata
                        </ListItem>
                        <ListItem
                            key={1}
                            className={styles.listItem}
                            button
                            onClick={() => setSettings(PROJECT)}
                            selected={settings === PROJECT}
                        >
                            Project
                        </ListItem>
                    </List>
                </div>
                <div className={styles.innerBodyContainer}>
                    <ConditionallyRender
                        condition={settings === METADATA}
                        show={
                            <FeatureSettingsInformation
                                projectId={projectId}
                                featureId={featureId}
                            />
                        }
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
