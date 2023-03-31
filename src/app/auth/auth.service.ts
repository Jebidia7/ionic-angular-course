import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {BehaviorSubject, map, tap} from "rxjs";
import {User} from "./user.model";

export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // @ts-ignore
    private _user = new BehaviorSubject<User>(null);

    constructor(private httpClient: HttpClient) {
    }

    signup(email: string, password: string) {

        return this.httpClient.post<AuthResponseData>(
            `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseApiKey}`,
            {email: email, password: password, returnSecureToken: true}
        ).pipe(tap(this.setUserData.bind(this)));
    }

    login(email: string, password: string) {
        return this.httpClient.post<AuthResponseData>(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseApiKey}`,
            {email: email, password: password, returnSecureToken: true}
        ).pipe(tap(this.setUserData.bind(this)));
    }

    logout() {
        // @ts-ignore
        this._user.next(null);
    }

    get userIsAuthenticated() {
        return this._user.asObservable().pipe(map(user => {
            if (user) {
                return !!user.token;
            } else {
                return false;
            }
        }));
    }

    get userId() {
        return this._user.asObservable().pipe(map(user => {
            if (user) {
                return user.id;
            } else {
                return '';
            }
        }));
    }

    private setUserData(userData: AuthResponseData) {
        const expirationTime = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
        this._user.next(new User(
            userData.localId,
            userData.email,
            userData.idToken,
            expirationTime
        ));
    }
}
