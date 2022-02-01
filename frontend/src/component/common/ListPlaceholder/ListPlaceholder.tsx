import { ListItem } from '@material-ui/core';
import { Link } from 'react-router-dom';
import ConditionallyRender from '../ConditionallyRender';
import { useStyles } from './ListPlaceholder.styles';

interface IListPlaceholderProps {
    text: string;
    link?: string;
    linkText?: string;
}

const ListPlaceholder = ({ text, link, linkText }: IListPlaceholderProps) => {
    const styles = useStyles();

    return (
        <ListItem className={styles.emptyStateListItem}>
            {text}
            <ConditionallyRender
                condition={Boolean(link && linkText)}
                show={<Link to={link}>Add your first toggle</Link>}
            />
        </ListItem>
    );
};

export default ListPlaceholder;
