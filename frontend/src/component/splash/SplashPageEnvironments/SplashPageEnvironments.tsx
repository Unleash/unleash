import { SplashPageEnvironmentsContent } from 'component/splash/SplashPageEnvironments/SplashPageEnvironmentsContent/SplashPageEnvironmentsContent';
import { SplashPageEnvironmentsContainer } from 'component/splash/SplashPageEnvironments/SplashPageEnvironmentsContainer/SplashPageEnvironmentsContainer';
import { VpnKey, CloudCircle } from '@material-ui/icons';
import { useStyles } from 'component/splash/SplashPageEnvironments/SplashPageEnvironments.styles';
import { ReactComponent as Logo1 } from 'assets/img/splash_env1.svg';
import { ReactComponent as Logo2 } from 'assets/img/splash_env2.svg';
import { useHistory } from 'react-router-dom';

export const SplashPageEnvironments = () => {
    const styles = useStyles();
    const { push } = useHistory();

    const onFinish = () => {
        push('/');
    };

    return (
        <>
            <SplashPageEnvironmentsContent
                onFinish={onFinish}
                components={[
                    <SplashPageEnvironmentsContainer
                        key={1}
                        title={
                            <h2 className={styles.title}>
                                Environments are coming to Unleash!
                            </h2>
                        }
                        topDescription={
                            <p className={styles.topDescription}>
                                We are bringing native environment support to
                                Unleash.{' '}
                                <b>
                                    Your current configurations won’t be
                                    affected,
                                </b>{' '}
                                but you’ll have the option of adding strategies
                                to specific environments going forward.
                            </p>
                        }
                        bottomDescription={
                            <p className={styles.bottomDescription}>
                                By default you will get access to three
                                environments: <b>default</b>, <b>development</b>{' '}
                                and<b> production</b>. All of your current
                                configurations will live in the default
                                environment and{' '}
                                <b>
                                    nothing will change until you make a
                                    conscious decision to change.
                                </b>
                            </p>
                        }
                        image={<CloudCircle className={styles.icon} />}
                    />,
                    <SplashPageEnvironmentsContainer
                        key={2}
                        title={
                            <h2 className={styles.title}>
                                Strategies live in environments
                            </h2>
                        }
                        topDescription={
                            <p className={styles.topDescription}>
                                A feature toggle lives as an entity across
                                multiple environments, but your strategies will
                                live in a specific environment. This allows you
                                to have different configuration per environment
                                for a feature toggle.
                            </p>
                        }
                        image={<Logo1 className={styles.logo} />}
                    />,
                    <SplashPageEnvironmentsContainer
                        key={3}
                        title={
                            <h2 className={styles.title}>
                                Environments are turned on per project
                            </h2>
                        }
                        topDescription={
                            <p className={styles.topDescription}>
                                In order to enable an environment for a feature
                                toggle you must first enable the environment in
                                your project. Navigate to your project settings
                                and enable the environments you want to be
                                available. The toggles in that project will get
                                access to all of the project’s enabled
                                environments.
                            </p>
                        }
                        image={<Logo2 className={styles.logo} />}
                    />,
                    <SplashPageEnvironmentsContainer
                        key={4}
                        title={
                            <h2 className={styles.title}>
                                API Keys control which environment you get the
                                configuration from
                            </h2>
                        }
                        topDescription={
                            <p className={styles.topDescription}>
                                When you have set up environments for your
                                feature toggles and added strategies to the
                                specific environments, you must create
                                environment-specific API keys — one for each
                                environment.
                            </p>
                        }
                        bottomDescription={
                            <p className={styles.bottomDescription}>
                                Environment-specific API keys lets the SDK
                                receive configuration only for the specified
                                environment.
                            </p>
                        }
                        image={<VpnKey className={styles.icon} />}
                    />,
                    <SplashPageEnvironmentsContainer
                        key={5}
                        title={
                            <h2 className={styles.title}>Want to know more?</h2>
                        }
                        topDescription={
                            <div className={styles.topDescription}>
                                If you’d like some more info on environments,
                                check out some of the resources below! The
                                documentation or the video walkthrough is a
                                great place to start. If you’d like to try it
                                out in a risk-free setting first, how about
                                heading to the demo instance?
                                <ul className={styles.linkList}>
                                    <li>
                                        <a
                                            href="https://www.loom.com/share/95239e875bbc4e09a5c5833e1942e4b0?t=0"
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.link}
                                        >
                                            Video walkthrough
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://app.unleash-hosted.com/demo/"
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.link}
                                        >
                                            The Unleash demo instance
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://docs.getunleash.io/user_guide/environments"
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.link}
                                        >
                                            Environments reference documentation
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="https://www.getunleash.io/blog/simplify-rollout-management-with-the-new-environments-feature"
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.link}
                                        >
                                            Blog post introducing environments
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        }
                        bottomDescription={
                            <p className={styles.bottomDescription}>
                                If you have any questions or need help, feel
                                free to ping us on{' '}
                                <a
                                    target="_blank"
                                    href="https://slack.unleash.run/"
                                    rel="noreferrer"
                                    className={styles.link}
                                >
                                    slack!
                                </a>
                            </p>
                        }
                    />,
                ]}
            />
        </>
    );
};
