import {
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tooltip,
} from '@material-ui/core';
import { Add, RadioButtonChecked } from '@material-ui/icons';
import { AppsLinkList } from 'component/common';
import ConditionallyRender from 'component/common/ConditionallyRender';
import styles from '../../strategies.module.scss';
import { TogglesLinkList } from '../../TogglesLinkList/TogglesLinkList';
import { IParameter, IStrategy } from 'interfaces/strategy';
import { IApplication } from 'interfaces/application';
import { IFeatureToggle } from 'interfaces/featureToggle';

interface IStrategyDetailsProps {
    strategy: IStrategy;
    applications: IApplication[];
    toggles: IFeatureToggle[];
}

export const StrategyDetails = ({
    strategy,
    applications,
    toggles,
}: IStrategyDetailsProps) => {
    const { parameters = [] } = strategy;
    const renderParameters = (params: IParameter[]) => {
        if (params.length > 0) {
            return params.map(({ name, type, description, required }, i) => (
                <ListItem key={`${name}-${i}`}>
                    <ConditionallyRender
                        condition={required}
                        show={
                            <Tooltip title="Required">
                                <ListItemAvatar>
                                    <Add />
                                </ListItemAvatar>
                            </Tooltip>
                        }
                        elseShow={
                            <Tooltip title="Optional">
                                <ListItemAvatar>
                                    <RadioButtonChecked />
                                </ListItemAvatar>
                            </Tooltip>
                        }
                    />
                    <ListItemText
                        primary={
                            <div>
                                {name} <small>({type})</small>
                            </div>
                        }
                        secondary={description}
                    />
                </ListItem>
            ));
        } else {
            return <ListItem>No params</ListItem>;
        }
    };

    return (
        <div className={styles.listcontainer}>
            <Grid container>
                <ConditionallyRender
                    condition={strategy.deprecated}
                    show={
                        <Grid item>
                            <h5 style={{ color: '#ff0000' }}>Deprecated</h5>
                        </Grid>
                    }
                />
                <Grid item sm={12} md={12}>
                    <h6>Parameters</h6>
                    <hr />
                    <List>{renderParameters(parameters)}</List>
                </Grid>

                <Grid item sm={12} md={6}>
                    <h6>Applications using this strategy</h6>
                    <hr />
                    <AppsLinkList apps={applications} />
                </Grid>

                <Grid item sm={12} md={6}>
                    <h6>Toggles using this strategy</h6>
                    <hr />
                    <TogglesLinkList toggles={toggles} />
                </Grid>
            </Grid>
        </div>
    );
};
