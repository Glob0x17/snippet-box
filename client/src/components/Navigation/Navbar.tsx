import { NavLink } from 'react-router-dom';
import { Route } from '../../typescript/interfaces';
import { routes as clientRoutes } from './routes.json';
import { useAuth } from '../../store/AuthContext';

export const Navbar = (): JSX.Element => {
  const routes = clientRoutes as Route[];
  const { user, logout } = useAuth();

  return (
    <nav className='navbar navbar-dark bg-dark navbar-expand'>
      <div className='container-fluid'>
        <ul className='navbar-nav'>
          {routes.map(({ name, dest }, idx) => (
            <li className='nav-item' key={idx}>
              <NavLink to={dest} end className='nav-link'>
                {name}
              </NavLink>
            </li>
          ))}
        </ul>
        <ul className='navbar-nav ms-auto align-items-center'>
          {user && (
            <li className='nav-item text-light me-3'>
              <span style={{ fontSize: '0.875rem' }}>
                {user.email || user.name || user.preferred_username || user.sub}
              </span>
            </li>
          )}
          <li className='nav-item'>
            <button
              type='button'
              className='btn btn-sm btn-outline-light'
              onClick={() => logout()}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};
