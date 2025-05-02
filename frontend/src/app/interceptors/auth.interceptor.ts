import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from "@angular/common/http";
import { inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { first, mergeMap } from "rxjs/operators";
import { AppState } from "../store/reducers"; // Adjust path as needed
import { selectAuthToken } from "../store/selectors/auth.selectors"; // Adjust path as needed

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const store = inject(Store<AppState>);

  // Get the auth token from the store
  return store.select(selectAuthToken).pipe(
    first(), // Take the first value emitted and complete
    mergeMap(token => {
      // If a token exists, clone the request and add the Authorization header
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      } else {
        // If no token, proceed with the original request
        return next(req);
      }
    })
  );
};

