import Cookies from 'js-cookie';

export const setTokens = (access: string, refresh: string) => {
  Cookies.set('access', access, { expires: 1 }); // 1 day
  Cookies.set('refresh', refresh, { expires: 7 }); // 7 days
};

export const logout = () => {
  Cookies.remove('access');
  Cookies.remove('refresh');
  window.location.href = '/login';
};

export const isAuthenticated = () => {
  return !!Cookies.get('access');
};