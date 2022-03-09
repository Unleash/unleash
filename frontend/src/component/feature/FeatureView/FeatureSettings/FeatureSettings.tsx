import { useState } from 'react';
import PageContent from '../../../common/PageContent';
import { useStyles } from './FeatureSettings.styles';
import { List, ListItem } from '@material-ui/core';
import ConditionallyRender from '../../../common/ConditionallyRender';
import FeatureSettingsProject from './FeatureSettingsProject/FeatureSettingsProject';
import { useParams } from 'react-router-dom';
import { IFeatureViewParams } from '../../../../interfaces/params';
import { FeatureSettingsInformation } from './FeatureSettingsInformation/FeatureSettingsInformation';

const METADATA = 'metadata';
const PROJECT = 'project';

export const FeatureSettings = () => {
    const styles = useStyles();
    const { projectId, featureId } = useParams<IFeatureViewParams>();
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
