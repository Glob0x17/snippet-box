import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navigation/Navbar';
import { Editor, Home, Snippet, Snippets } from './containers';
import { SnippetsContextProvider, AuthProvider, useAuth } from './store';
import { Login } from './components/Login';

const AppShell = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className='container-lg py-5 text-center'>
        <div className='spinner-border text-light' role='status' />
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <SnippetsContextProvider>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/snippets' element={<Snippets />} />
        <Route path='/snippet/:id' element={<Snippet />} />
        <Route path='/editor' element={<Editor />} />
        <Route path='/editor/:id' element={<Editor />} />
      </Routes>
    </SnippetsContextProvider>
  );
};

export const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  </BrowserRouter>
);
