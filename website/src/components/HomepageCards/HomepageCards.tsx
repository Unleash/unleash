import styles from './cards.module.css';
import BookIcon from './icons/book.svg';
import ChatIcon from './icons/chat.svg';
import DotCircleIcon from './icons/dot-circle.svg';
import IntegrationsIcon from './icons/integrations.svg';
import MortarAcademyIcon from './icons/mortar-academy.svg';
import SdkIcon from './icons/sdk.svg';

const cardsData = [
    {
        title: 'Quickstart',
        description: 'Get up and running with Unleash in less than 5 minutes.',
        icon: <DotCircleIcon />,
    },
    {
        title: 'Tutorials and Guides',
        description:
            'Explore best practices and step-by-step tutorials to help you integrate Unleash into your stack.',
        icon: <BookIcon />,
    },
    {
        title: 'SDKs',
        description:
            'With over 30 SDKs, we enable fast and secure feature flagging across all major programming languages.',
        icon: <SdkIcon />,
    },
    {
        title: 'Unleash Academy',
        description:
            'Enroll in Unleash Academy to learn core concepts and best practices and gain feature flag expertise.',
        icon: <MortarAcademyIcon />,
    },
    {
        title: 'Integrations',
        description:
            'Connect Unleash to your existing workflows. Integrate with popular tools like GitHub, Slack, CI/CD pipelines.',
        icon: <IntegrationsIcon />,
    },
    {
        title: 'Get in touch',
        description: 'Reach out to us for any questions or support.',
        icon: <ChatIcon />,
    },
];

const HomepageCard = () => {
    return (
        <div className={styles.container}>
            {cardsData.map((card, index) => (
                <div key={index} className={styles.card}>
                    <div className={styles.icon}>{card.icon}</div>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                </div>
            ))}
        </div>
    );
};

export default HomepageCard;
