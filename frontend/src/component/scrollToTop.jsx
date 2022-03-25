import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

class ScrollToTop extends Component {
    static propTypes = {
        location: PropTypes.object.isRequired,
    };

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            if (
                this.props.location.pathname.includes('/features/metrics') ||
                this.props.location.pathname.includes('/features/variants') ||
                this.props.location.pathname.includes('/features/strategies') ||
                this.props.location.pathname.includes('/logs') ||
                this.props.location.pathname.includes('/admin/api') ||
                this.props.location.pathname.includes('/admin/users') ||
                this.props.location.pathname.includes('/admin/auth')
            ) {
                return;
            }

            window.scrollTo(0, 0);
        }
    }

    render() {
        return this.props.children;
    }
}

export default withRouter(ScrollToTop);
