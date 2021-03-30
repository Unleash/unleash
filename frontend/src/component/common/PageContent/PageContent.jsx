import React from 'react';
import PropTypes from 'prop-types';

import classnames from 'classnames';
import HeaderTitle from '../HeaderTitle';
import { Paper } from '@material-ui/core';
import { useStyles } from './styles';

const PageContent = ({ children, headerContent, disablePadding, disableBorder, ...rest }) => {
    const styles = useStyles();

    const headerClasses = classnames(styles.headerContainer, {
        [styles.paddingDisabled]: disablePadding,
        [styles.borderDisabled]: disableBorder,
    });

    const bodyClasses = classnames(styles.bodyContainer, {
        [styles.paddingDisabled]: disablePadding,
        [styles.borderDisabled]: disableBorder,
    });

    let header = null;
    if (headerContent) {
        if (typeof headerContent === 'string') {
            header = (
                <div className={headerClasses}>
                    <HeaderTitle title={headerContent} />
                </div>
            );
        } else {
            header = <div className={headerClasses}>{headerContent}</div>;
        }
    }

    const paperProps = disableBorder ? { elevation: 0 } : {};

    return (
        <Paper {...rest} {...paperProps}>
            {header}
            <div className={bodyClasses}>{children}</div>
        </Paper>
    );
};

export default PageContent;

PageContent.propTypes = {
    headerContent: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    disablePadding: PropTypes.bool,
    disableBorder: PropTypes.bool,
};
