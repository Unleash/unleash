import React from 'react';

interface IGradientProps {
    from: string;
    to: string;
    style?: object;
}

const Gradient: React.FC<IGradientProps> = ({
    children,
    from,
    to,
    style,
    ...rest
}) => {
    return (
        <div
            style={{
                background: `linear-gradient(${from}, ${to})`,
                height: '100%',
                width: '100%',
                position: 'relative',
                ...style,
            }}
            {...rest}
        >
            {children}
        </div>
    );
};

export default Gradient;
