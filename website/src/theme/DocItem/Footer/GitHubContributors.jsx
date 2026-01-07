// biome-ignore lint/correctness/noUnusedImports: Needs this for React to work
import React, { useState, useEffect } from 'react';
import { getContributors } from './contributors';
import styles from './contributors.module.css';

const unleashTeam = new Map([
    ['alvinometric', 'developer advocate, Unleash'],
    ['ardeche07', 'head of marketing, Unleash'],
    ['ferrantim', 'head of marketing, Unleash'],
    ['chriswk', 'principal developer, Unleash'],
    ['daveleek', 'developer, Unleash'],
    ['FredrikOseberg', 'principal developer, Unleash'],
    ['gardleopard', 'platform lead, Unleash'],
    ['gastonfournier', 'senior developer, Unleash'],
    ['ivarconr', 'co-founder, Unleash'],
    ['kwasniew', 'senior developer, Unleash'],
    ['nnennandukwe', 'developer advocate, Unleash'],
    ['nunogois', 'senior developer, Unleash'],
    ['sighphyre', 'senior developer, Unleash'],
    ['sjaanus', 'senior developer, Unleash'],
    ['thomasheartman', 'developer, Unleash'],
    ['Tymek', 'developer, Unleash'],
    ['sebastian-bury', 'implementation architect, Unleash'],
    ['melindafekete', 'documentation lead, Unleash'],
]);

const GitHubContributors = ({ owner, repo, filePath }) => {
    const [contributors, setContributors] = useState([]);
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?path=${filePath}`;

    useEffect(() => {
        const fetchFileContributors = () => {
            fetch(url)
                .then((response) => response.json())
                .then((commits) => {
                    const contributors = getContributors(commits);

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
        return null;
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
                                    src={`${contributor.avatar_url}&s=66`}
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
