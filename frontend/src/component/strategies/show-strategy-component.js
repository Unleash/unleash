import React, { PropTypes, PureComponent } from 'react';
import { Grid, Cell, List, ListItem, ListItemContent } from 'react-mdl';
import { AppsLinkList, TogglesLinkList } from '../common';

class ShowStrategyComponent extends PureComponent {
    static propTypes () {
        return {
            toggles: PropTypes.array,
            applications: PropTypes.array,
            strategy: PropTypes.object.isRequired,
        };
    }

    renderParameters (params) {
        if (params) {
            return params.map(({ name, type, description, required }, i) => (
                <ListItem twoLine key={`${name}-${i}`} title={required ? 'Required' : ''}>
                    <ListItemContent avatar={required ? 'add' : ' '} subtitle={description}>
                        {name} <small>({type})</small>
                    </ListItemContent>
                </ListItem>
            ));
        } else {
            return <ListItem>(no params)</ListItem>;
        }
    }

    render () {
        const {
            strategy,
            applications,
            toggles,
        } = this.props;

        const {
            parameters = [],
        } = strategy;

        return (
            <div>

                <Grid>
                    <Cell col={12} >
                        <h6>Parameters</h6>
                        <hr />
                        <List>
                            {this.renderParameters(parameters)}
                        </List>
                    </Cell>

                    <Cell col={6} tablet={12}>
                        <h6>Applications using this strategy</h6>
                        <hr />
                        <AppsLinkList apps={applications} />
                    </Cell>

                    <Cell col={6} tablet={12}>
                        <h6>Toggles using this strategy</h6>
                        <hr />
                        <TogglesLinkList toggles={toggles} />
                    </Cell>
                </Grid>
            </div>
        );
    }
}


export default ShowStrategyComponent;
