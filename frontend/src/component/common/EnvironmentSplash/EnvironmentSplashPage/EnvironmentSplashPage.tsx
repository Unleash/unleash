interface EnvironmentSplashPageProps {
    title: React.ReactNode;
    topDescription: React.ReactNode;
    image?: React.ReactNode;
    bottomDescription?: React.ReactNode;
}

const EnvironmentSplashPage = ({
    title,
    topDescription,
    image,
    bottomDescription,
}: EnvironmentSplashPageProps) => {
    return (
        <div>
            {title}
            {topDescription}
            {image}
            {bottomDescription}
        </div>
    );
};

export default EnvironmentSplashPage;
