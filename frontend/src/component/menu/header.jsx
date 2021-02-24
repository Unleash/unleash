import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Header, Navigation } from 'react-mdl';
import { Route } from 'react-router-dom';
import { DrawerMenu } from './drawer';
import Breadcrum from './breadcrumb';
import ShowUserContainer from '../user/show-user-container';
import { loadInitialData } from './../../store/loader';

class HeaderComponent extends PureComponent {
    static propTypes = {
        uiConfig: PropTypes.object.isRequired,
        init: PropTypes.func.isRequired,
        location: PropTypes.object.isRequired,
    };

    componentDidMount() {
        const { init, uiConfig } = this.props;
        init(uiConfig.flags);
    }

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.location.pathname !== nextProps.location.pathname) {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                const layout = document.querySelector('.mdl-js-layout');
                const drawer = document.querySelector('.mdl-layout__drawer');
                // hack, might get a built in alternative later
                if (drawer.classList.contains('is-visible')) {
                    layout.MaterialLayout.toggleDrawer();
                }
            }, 10);
        }
    }

    render() {
        const { headerBackground, links, name, flags } = this.props.uiConfig;
        const style = headerBackground ? { background: headerBackground } : {};
        return (
            <React.Fragment>
                <Header scroll seamed title={<Route path="/:path" component={Breadcrum} />} style={style}>
                    <Navigation>
                        <ShowUserContainer />
                    </Navigation>
                </Header>
                <DrawerMenu links={links} title={name} flags={flags} />
            </React.Fragment>
        );
    }
}

export default connect(state => ({ uiConfig: state.uiConfig.toJS() }), { init: loadInitialData })(HeaderComponent);
