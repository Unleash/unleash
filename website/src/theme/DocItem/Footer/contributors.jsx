import { useState, useEffect } from 'react';
import styles from './contributors.module.scss';

const unleashTeam = new Map([
    ['alvinometric', 'developer advocate at Unleash'],
    ['andreas-unleash', ''],
    ['chriswk', ''],
    ['daveleek', ''],
    ['FredrikOseberg', ''],
    ['gardleopard', ''],
    ['gastonfournier', ''],
    ['ivarconr', ''],
    ['kwasniew', ''],
    ['nnennandukwe', ''],
    ['nunogois', ''],
    ['sighphyre', ''],
    ['sjaanus', ''],
    ['thomasheartman', ''],
    ['Tymek', ''],
]);

const GitHubContributors = ({ filePath }) => {
    const [contributors, setContributors] = useState([]);

    useEffect(() => {
        const fetchFileContributors = () => {
            fetch(
                `https://api.github.com/repos/unleash/unleash/commits?path=${filePath}`,
            )
                .then((response) => response.json())
                .then((commits) => {
                    const contributorSet = new Set();
                    for (const commit of commits) {
                        contributorSet.add(JSON.stringify(commit.author));
                    }
                    const contributors = Array.from(contributorSet).map((str) =>
                        JSON.parse(str),
                    );
                    setContributors(contributors);
                })
                .catch((error) => {
                    console.error(error);
                    setContributors([]);
                });
        };

        fetchFileContributors();
    }, []);

    if (!contributors.length) {
        return <h1>Fetching contributors...</h1>;
    }

    return (
        <div className={styles.contributors}>
            <h3>Contributors</h3>

            <div className={styles.wrapper}>
                {contributors?.map((contributor) => {
                    let description = contributor.login;

                    if (unleashTeam.has(contributor.login)) {
                        description += unleashTeam.get(contributor.login);
                    }

                    return (
                        <figure className={styles.contributor}>
                            <a href={contributor.html_url}>
                                <img
                                    src={contributor.avatar_url}
                                    alt={contributor.login}
                                    width={50}
                                    style={{ borderRadius: '100%' }}
                                />
                            </a>
                            <figcaption>{description}</figcaption>
                        </figure>
                    );
                })}
            </div>
        </div>
    );
};

export default GitHubContributors;
