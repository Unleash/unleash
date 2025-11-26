import styles from './cards.module.css';
import QuickstartIcon from './icons/quickstart.svg';
import TutorialsIcon from './icons/tutorials.svg';
import SdksIcon from './icons/sdks.svg';
import AcademyIcon from './icons/academy.svg';
import IntegrationsIcon from './icons/integrations.svg';
import GetInTouchIcon from './icons/get-in-touch.svg';

const cardsData = [
    {
        title: 'Quickstart',
        description: 'Get up and running with Unleash in less than 5 minutes.',
        icon: <QuickstartIcon />,
        href: '/quickstart',
    },
    {
        title: 'Tutorials and Guides',
        description:
            'Explore best practices and step-by-step tutorials to help you integrate Unleash into your stack.',
        icon: <TutorialsIcon />,
        href: '/guides-overview',
    },
    {
        title: 'SDKs',
        description:
            'With over 30 SDKs, we enable fast and secure feature flagging across all major programming languages.',
        icon: <SdksIcon />,
        href: '/sdks',
    },
    {
        title: 'Unleash Academy',
        description:
            'Enroll in Unleash Academy to learn core concepts and best practices and gain feature flag expertise.',
        icon: <AcademyIcon />,
        href: '/unleash-academy/introduction',
    },
    {
        title: 'Integrations',
        description:
            'Connect Unleash to your existing workflows. Integrate with popular tools like GitHub, Slack, CI/CD pipelines.',
        icon: <IntegrationsIcon />,
        href: '/reference/integrations',
    },
    {
        title: 'Get in touch',
        description: 'Reach out to us for any questions or support.',
        icon: <GetInTouchIcon />,
        href: 'https://www.getunleash.io/support',
    },
];

const HomepageCards = () => {
    return (
        <div className={styles.container}>
            {cardsData.map((card, index) => (
                <a href={card.href} key={index}>
                    <div key={index} className={styles.card}>
                        <div className={styles.cardbody}>
                            <div className={styles.title}>
                                {card.icon}
                                <h3>{card.title}</h3>
                            </div>

                            <p>{card.description}</p>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};

export default HomepageCards;
