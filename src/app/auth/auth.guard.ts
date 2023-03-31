import {Injectable} from '@angular/core';
import {CanMatch, Route, Router, UrlSegment, UrlTree} from '@angular/router';
import {Observable, take, tap} from 'rxjs';
import {AuthService} from "./auth.service";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanMatch {

    constructor(private authService: AuthService, private router: Router) {
    }

    canMatch(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return this.authService.userIsAuthenticated.pipe(
            take(1),
            tap(isAuthenticated => {
                if (!isAuthenticated) {
                    this.router.navigateByUrl('/auth');
                }
            })
        );
    }


}
