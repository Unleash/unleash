import React from 'react'

const ErrorMessages = ({errors}) => {
    render() {
        if (!errors.length) {
            return <div/>;
        }

        var errorNodes = errors.map(function(e, i) {
            return (<li key={e + i} className="largetext">{e}</li>);
        });

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
