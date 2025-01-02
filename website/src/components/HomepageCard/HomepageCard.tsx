import styles from './card.module.css';

const cardsData = [
    {
        title: 'Quickstart',
        description: 'Get up and running with Unleash in less than 5 minutes.',
    },
    {
        title: 'Tutorials and Guides',
        description:
            'Explore best practices and step-by-step tutorials to help you integrate Unleash into your stack.',
    },
    {
        title: 'SDKs',
        description:
            'With over 30 SDKs, we enable fast and secure feature flagging across all major programming languages.',
    },
    {
        title: 'Unleash Academy',
        description:
            'Enroll in Unleash Academy to learn core concepts and best practices and gain feature flag expertise.',
    },
    {
        title: 'Integrations',
        description:
            'Connect Unleash to your existing workflows. Integrate with popular tools like GitHub, Slack, CI/CD pipelines.',
    },
    {
        title: 'Get in touch',
        description:
            'Have questions or ideas? Join our active Slack community, contribute on GitHub, or schedule a conversation.',
    },
];

const Card = ({ title, description }) => {
    return (
        <div style={styles.card}>
            <h3 style={styles.title}>{title}</h3>
            <p style={styles.description}>{description}</p>
        </div>
    );
};

// Main Component
const Cards = () => {
    return (
        <div style={styles.grid}>
            {cardsData.map((card, index) => (
                <Card
                    key={index}
                    title={card.title}
                    description={card.description}
                />
            ))}
        </div>
    );
};

export default Cards;
