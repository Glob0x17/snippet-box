import { useAuth } from '../store/AuthContext';
import { Button } from './UI';

export const Login = () => {
  const { login } = useAuth();
  const providerName =
    import.meta.env.VITE_AUTH_PROVIDER_NAME || 'Single Sign-On';

  return (
    <div className='container-lg'>
      <div
        className='row justify-content-center align-items-center'
        style={{ minHeight: '80vh' }}
      >
        <div className='col-12 col-md-6 col-lg-4'>
          <div className='card'>
            <div className='card-body text-center'>
              <h3 className='card-title mb-3'>Snippet Box</h3>
              <p className='mb-4'>
                Sign in with your {providerName} account to access your
                snippets.
              </p>
              <div className='d-grid'>
                <Button
                  text={`Sign in with ${providerName}`}
                  color='primary'
                  handler={login}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
