import styles from './cards.module.css';
import QuickstartIcon from './icons/quickstart.svg';
import TutorialsIcon from './icons/tutorials.svg';
import SdksIcon from './icons/sdks.svg';
import AcademyIcon from './icons/academy.svg';
import IntegrationsIcon from './icons/integrations.svg';
import GetInTouchIcon from './icons/get-in-touch.svg';

const cardsData = [
    {
        title: 'Frontend API',
        description: 'Get up and running with Unleash in less than 5 minutes.',
        icon: <QuickstartIcon />,
        href: '/quickstart',
    },
    {
        title: 'Client API',
        description:
            'Explore best practices and step-by-step tutorials to help you integrate Unleash into your stack.',
        icon: <TutorialsIcon />,
        href: '/feature-flag-tutorials/use-cases/gradual-rollout',
    },
    {
        title: 'Admin API',
        description:
            'With over 30 SDKs, we enable fast and secure feature flagging across all major programming languages.',
        icon: <SdksIcon />,
        href: '/reference/sdks',
    },
];

const APICards = () => {
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

export default APICards;
