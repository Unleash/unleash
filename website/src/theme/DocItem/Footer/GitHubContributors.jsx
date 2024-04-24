// biome-ignore lint/correctness/noUnusedImports: Needs this for React to work
import React, { useState, useEffect } from 'react';
import { getContributors } from './contributors';
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

const GitHubContributors = ({ owner, repo, filePath }) => {
    const [contributors, setContributors] = useState([]);
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?path=${filePath}`;

    useEffect(() => {
        const fetchFileContributors = () => {
            fetch(url)
                .then((response) => response.json())
                .then((commits) => {
                    console.log(commits);
                    const contributors = getContributors(commits);
                    console.log(contributors);
                    contributors.sort((a, b) => {
                        if (unleashTeam.has(a.login)) {
                            return -1;
                        }
                        return 1;
                    });
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

            <ul className={styles.wrapper}>
                {contributors?.map((contributor) => {
                    const isUnleashTeam = unleashTeam.has(contributor.login);
                    const name = isUnleashTeam
                        ? `${contributor.login}, ${unleashTeam.get(
                              contributor.login,
                          )}`
                        : contributor.login;
                    return (
                        <li
                            key={contributor.login}
                            className={styles.contributor}
                        >
                            <a
                                href={contributor.html_url}
                                className={isUnleashTeam ? styles.unleash : ''}
                                title={`@${name}`}
                            >
                                <img
                                    src={contributor.avatar_url}
                                    alt={contributor.login}
                                    width={70}
                                />
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default GitHubContributors;
