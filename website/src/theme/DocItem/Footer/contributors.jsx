// biome-ignore lint/correctness/noUnusedImports: Needs this for React to work
import React, { useState, useEffect } from 'react';
import styles from './contributors.module.scss';

const unleashTeam = new Map([
    ['alvinometric', 'developer advocate, Unleash'],
    ['andreas-unleash', 'senior software engineer, Unleash'],
    ['chriswk', 'senior software engineer, Unleash'],
    ['daveleek', 'senior software engineer, Unleash'],
    ['FredrikOseberg', 'senior software engineer, Unleash'],
    ['gardleopard', 'senior software engineer, Unleash'],
    ['gastonfournier', 'senior software engineer, Unleash'],
    ['ivarconr', 'co-founder, Unleash'],
    ['kwasniew', 'senior software engineer, Unleash'],
    ['nnennandukwe', 'developer advocate, Unleash'],
    ['nunogois', 'senior software engineer, Unleash'],
    ['sighphyre', 'senior software engineer, Unleash'],
    ['sjaanus', 'senior software engineer, Unleash'],
    ['thomasheartman', 'senior software engineer, Unleash'],
    ['Tymek', 'senior software engineer, Unleash'],
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
                    // using a Set to deduplicate the list of contributors
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
        return <h3>Fetching contributors...</h3>;
    }

    return (
        <div className={styles.contributors}>
            <h3>Contributors</h3>

            <div className={styles.wrapper}>
                {contributors?.map((contributor) => {
                    return (
                        <figure className={styles.contributor}>
                            <a href={contributor.html_url}>
                                <img
                                    src={contributor.avatar_url}
                                    alt={contributor.login}
                                    width={70}
                                    style={{ borderRadius: '100%' }}
                                />
                            </a>
                            <figcaption>
                                <code>{contributor.login}</code>

                                {unleashTeam.has(contributor.login) && (
                                    <p>{unleashTeam.get(contributor.login)}</p>
                                )}
                            </figcaption>
                        </figure>
                    );
                })}
            </div>
        </div>
    );
};

export default GitHubContributors;
