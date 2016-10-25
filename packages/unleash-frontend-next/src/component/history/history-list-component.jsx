import React, { Component } from 'react';
import { List, ListItem, ListSubHeader, ListDivider } from 'react-toolbox/lib/list';
import FontIcon from 'react-toolbox/lib/font_icon';
import Chip from 'react-toolbox/lib/chip';

class StrategiesListComponent extends Component {

    static contextTypes = {
        router: React.PropTypes.object,
    }

    componentDidMount () {
        this.props.fetchHistory();
    }

    getIcon (type) {
        if (type.indexOf('created') > -1 ) {
            return 'add';
        }

        if (type.indexOf('deleted') > -1 ) {
            return 'remove';
        }

        if (type.indexOf('updated') > -1 ) {
            return 'update';
        }

        if (type.indexOf('archived') > -1 ) {
            return 'archived';
        }
        return 'bookmark';
    }

    render () {
        const { history } = this.props;

        return (
            <List ripple >
                <ListSubHeader caption="History" />
                {history.length > 0 ? history.map((log, i) => {
                    const actions = [];


                    const icon = this.getIcon(log.type);

                    const caption = <div>{log.data.name} <small>{log.type}</small></div>;

                    return (
                        <ListItem key={i}
                            leftIcon={icon}
                            rightActions={actions}
                            caption={caption}
                            legend={log.createdAt} />
                    );
                }) : <ListItem caption="No log entries" />}

            </List>
        );
    }
}


export default StrategiesListComponent;
