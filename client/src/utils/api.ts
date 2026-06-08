import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: '/',
  withCredentials: true
});

export const isUnauthorized = (err: unknown): boolean => {
  return err instanceof AxiosError && err.response?.status === 401;
};

export const redirectToLogin = (): void => {
  const returnTo = encodeURIComponent(
    window.location.pathname + window.location.search
  );
  window.location.href = `/auth/login?returnTo=${returnTo}`;
};
