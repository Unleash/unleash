'use strict';
const React = require('react');

const ErrorMessages = React.createClass({
    render() {
        if (!this.props.errors.length) {
            return <div/>;
        }

        const errorNodes = this.props.errors.map((e, i) => <li key={e + i} className="largetext">{e}</li>);

        return (
            <div className="container">
                <div className="mod shadow mtm mrn">
                    <div className="inner bg-red-lt">
                        <div className="bd">
                            <div className="media centerify">
                                <div className="imgExt">
                                    <a onClick={this.props.onClearErrors}
                                        className="icon-kryss1 linkblock sharp">
                                    </a>
                                </div>
                                <div className="bd">
                                    <ul>{errorNodes}</ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ErrorMessages;
