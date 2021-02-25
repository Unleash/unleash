const ConditionallyRender = ({ condition, show, elseShow }) => {
    const handleFunction = renderFunc => {
        const result = renderFunc();
        if (!result) {
            /* eslint-disable-next-line */
            console.warn(
                'Nothing was returned from your render function. Verify that you are returning a valid react component'
            );
            return null;
        }
        return result;
    };

    const isFunc = param => typeof param === 'function';

    if (condition && show) {
        if (isFunc(show)) {
            return handleFunction(show);
        }

        return show;
    }
    if (!condition && elseShow) {
        if (isFunc(elseShow)) {
            return handleFunction(elseShow);
        }
        return elseShow;
    }
    return null;
};

export default ConditionallyRender;
