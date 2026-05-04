import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token = localStorage.getItem('access_token');

  if (!token || token === 'null' || token === 'undefined') {
    token = sessionStorage.getItem('access_token');
  }

  if (token && token !== 'null' && token !== 'undefined') {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(authReq);
  }

  return next(req);
};
