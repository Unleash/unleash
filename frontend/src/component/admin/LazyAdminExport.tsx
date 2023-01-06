// Lazy loading only supports default export. We have an ADR
// that says we should only use named exports, because
// it makes it harder to diverge from the name of the component when
// importing it in other files.
import { Admin } from './Admin';

export default Admin;
