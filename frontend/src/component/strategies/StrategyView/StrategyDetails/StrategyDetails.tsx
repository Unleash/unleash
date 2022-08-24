import {
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tooltip,
    useTheme,
} from '@mui/material';
import { Add, RadioButtonChecked } from '@mui/icons-material';
import { AppsLinkList } from 'component/common';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import styles from '../../strategies.module.scss';
import { TogglesLinkList } from 'component/strategies/TogglesLinkList/TogglesLinkList';
import { IStrategy, IStrategyParameter } from 'interfaces/strategy';
import { IApplication } from 'interfaces/application';
import { FeatureSchema } from 'openapi';

interface IStrategyDetailsProps {
    strategy: IStrategy;
    applications: IApplication[];
    toggles: FeatureSchema[];
}

export const StrategyDetails = ({
    strategy,
    applications,
    toggles,
}: IStrategyDetailsProps) => {
    const theme = useTheme();
    const { parameters = [] } = strategy;
    const renderParameters = (params: IStrategyParameter[]) => {
        if (params.length > 0) {
            return params.map(({ name, type, description, required }, i) => (
                <ListItem key={`${name}-${i}`}>
                    <ConditionallyRender
                        condition={required}
                        show={
                            <ListItemAvatar>
                                <Tooltip title="Required parameter" arrow>
                                    <Add aria-hidden={false} />
                                </Tooltip>
                            </ListItemAvatar>
                        }
                        elseShow={
                            <ListItemAvatar>
                                <Tooltip title="Optional parameter" arrow>
                                    <RadioButtonChecked aria-hidden={false} />
                                </Tooltip>
                            </ListItemAvatar>
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
                            <h5 style={{ color: theme.palette.error.main }}>
                                Deprecated
                            </h5>
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
