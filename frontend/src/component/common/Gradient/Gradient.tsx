interface IGradientProps {
    from: string;
    to: string;
}

const Gradient: React.FC<IGradientProps> = ({
    children,
    from,
    to,
    ...rest
}) => {
    return (
        <div
            style={{
                background: `linear-gradient(${from}, ${to})`,
                height: '100%',
                width: '100%',
            }}
            {...rest}
        >
            {children}
        </div>
    );
};

export default Gradient;
