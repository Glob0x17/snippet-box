import { useState, createContext, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, isUnauthorized, redirectToLogin } from '../utils/api';
import {
  Context,
  Snippet,
  Response,
  TagCount,
  NewSnippet,
  SearchQuery
} from '../typescript/interfaces';

const noop = () => {};

export const SnippetsContext = createContext<Context>({
  snippets: [],
  searchResults: [],
  currentSnippet: null,
  tagCount: [],
  getSnippets: noop,
  getSnippetById: noop,
  setSnippet: noop,
  createSnippet: noop,
  updateSnippet: noop,
  deleteSnippet: noop,
  toggleSnippetPin: noop,
  countTags: noop,
  searchSnippets: noop
});

export const SnippetsContextProvider = ({ children }: { children: ReactNode }) => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchResults, setSearchResults] = useState<Snippet[]>([]);
  const [currentSnippet, setCurrentSnippet] = useState<Snippet | null>(null);
  const [tagCount, setTagCount] = useState<TagCount[]>([]);

  const navigate = useNavigate();

  const handleError = (err: unknown) => {
    if (isUnauthorized(err)) {
      redirectToLogin();
      return;
    }
    navigate('/');
  };

  const getSnippets = (): void => {
    api
      .get<Response<Snippet[]>>('/api/snippets')
      .then(res => setSnippets(res.data.data))
      .catch(handleError);
  };

  const getSnippetById = (id: number): void => {
    api
      .get<Response<Snippet>>(`/api/snippets/${id}`)
      .then(res => setCurrentSnippet(res.data.data))
      .catch(handleError);
  };

  const setSnippet = (id: number): void => {
    if (id < 0) {
      setCurrentSnippet(null);
      return;
    }
    getSnippetById(id);
    const snippet = snippets.find(s => s.id === id);
    if (snippet) setCurrentSnippet(snippet);
  };

  const createSnippet = (snippet: NewSnippet): void => {
    api
      .post<Response<Snippet>>('/api/snippets', snippet)
      .then(res => {
        setSnippets([...snippets, res.data.data]);
        setCurrentSnippet(res.data.data);
        navigate(`/snippet/${res.data.data.id}`, {
          state: { from: '/snippets' }
        });
      })
      .catch(handleError);
  };

  const updateSnippet = (
    snippet: NewSnippet,
    id: number,
    isLocal?: boolean
  ): void => {
    api
      .put<Response<Snippet>>(`/api/snippets/${id}`, snippet)
      .then(res => {
        const idx = snippets.findIndex(s => s.id === id);
        setSnippets([
          ...snippets.slice(0, idx),
          res.data.data,
          ...snippets.slice(idx + 1)
        ]);
        setCurrentSnippet(res.data.data);
        if (!isLocal) {
          navigate(`/snippet/${res.data.data.id}`, {
            state: { from: '/snippets' }
          });
        }
      })
      .catch(handleError);
  };

  const deleteSnippet = (id: number): void => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    api
      .delete<Response<unknown>>(`/api/snippets/${id}`)
      .then(() => {
        const idx = snippets.findIndex(s => s.id === id);
        setSnippets([...snippets.slice(0, idx), ...snippets.slice(idx + 1)]);
        setSnippet(-1);
        navigate('/snippets');
      })
      .catch(handleError);
  };

  const toggleSnippetPin = (id: number): void => {
    const snippet = snippets.find(s => s.id === id);
    if (snippet) {
      updateSnippet({ ...snippet, isPinned: !snippet.isPinned }, id, true);
    }
  };

  const countTags = (): void => {
    api
      .get<Response<TagCount[]>>('/api/snippets/statistics/count')
      .then(res => setTagCount(res.data.data))
      .catch(handleError);
  };

  const searchSnippets = (query: SearchQuery): void => {
    api
      .post<Response<Snippet[]>>('/api/snippets/search', query)
      .then(res => setSearchResults(res.data.data))
      .catch(err => {
        if (isUnauthorized(err)) redirectToLogin();
      });
  };

  return (
    <SnippetsContext.Provider
      value={{
        snippets,
        searchResults,
        currentSnippet,
        tagCount,
        getSnippets,
        getSnippetById,
        setSnippet,
        createSnippet,
        updateSnippet,
        deleteSnippet,
        toggleSnippetPin,
        countTags,
        searchSnippets
      }}
    >
      {children}
    </SnippetsContext.Provider>
  );
};
