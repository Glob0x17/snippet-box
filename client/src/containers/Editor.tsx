import { Fragment, useEffect, useContext, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { SnippetForm } from '../components/Snippets/SnippetForm';
import { Layout, PageHeader } from '../components/UI';
import { SnippetsContext } from '../store';

export const Editor = (): JSX.Element => {
  const { setSnippet: setCurrentSnippet } = useContext(SnippetsContext);
  const [inEdit, setInEdit] = useState(false);

  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/snippets';

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      setCurrentSnippet(Number(id));
      setInEdit(true);
    } else {
      setCurrentSnippet(-1);
      setInEdit(false);
    }
  }, [id]);

  return (
    <Layout>
      {inEdit ? (
        <Fragment>
          <PageHeader<{ from: string }>
            title='Edit snippet'
            prevDest={from}
            prevState={{ from: '/snippets' }}
          />
          <SnippetForm inEdit />
        </Fragment>
      ) : (
        <Fragment>
          <PageHeader title='Add new snippet' />
          <SnippetForm />
        </Fragment>
      )}
    </Layout>
  );
};
