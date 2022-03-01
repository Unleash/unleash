interface IConditionallyRenderProps {
    condition: boolean;
    show: TargetElement;
    elseShow?: TargetElement;
}

type TargetElement = JSX.Element | JSX.Element[] | RenderFunc | null;
type RenderFunc = () => JSX.Element;

const ConditionallyRender = ({
    condition,
    show,
    elseShow,
}: IConditionallyRenderProps): JSX.Element | null => {
    const handleFunction = (renderFunc: RenderFunc): JSX.Element | null => {
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

    const isFunc = (param: TargetElement): boolean => {
        return typeof param === 'function';
    };

    if (condition) {
        if (isFunc(show)) {
            return handleFunction(show as RenderFunc);
        }

        return show as JSX.Element;
    }
    if (!condition && elseShow) {
        if (isFunc(elseShow)) {
            return handleFunction(elseShow as RenderFunc);
        }
        return elseShow as JSX.Element;
    }
    return null;
};

export default ConditionallyRender;
