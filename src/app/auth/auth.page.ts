import {Component, OnInit} from '@angular/core';
import {AuthResponseData, AuthService} from "./auth.service";
import {Router} from "@angular/router";
import {AlertController, LoadingController} from "@ionic/angular";
import {NgForm} from "@angular/forms";
import {Observable} from "rxjs";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.page.html',
    styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

    isLoading = false;

    isLoginMode = true;

    constructor(
        private authService: AuthService,
        private router: Router,
        private loadingController: LoadingController,
        private alertController: AlertController) {
    }

    ngOnInit() {
    }

    authenticate(email: string, password: string) {
        this.isLoading = true;
        this.loadingController.create({
            keyboardClose: true,
            message: 'Logging in...'
        }).then(loadingElement => {
            loadingElement.present();
            let authObservable: Observable<AuthResponseData>;
            if(this.isLoginMode) {
                authObservable = this.authService.login(email, password);
            }
            else {
                authObservable = this.authService.signup(email, password);
            }

            authObservable.subscribe(responseData => {
                console.log(responseData);
                this.isLoading = false;
                loadingElement.dismiss();
                this.router.navigateByUrl('/places/discover');
            }, errorResponse => {
                loadingElement.dismiss();
                const code = errorResponse.error.error.message;
                let message = 'Could not sign up using provided info.';
                if(code === 'EMAIL_EXISTS') {
                    message = 'This email address already exists!';
                }
                else if(code === 'EMAIL_NOT_FOUND') {
                    message = 'Email address not registered.';
                }
                else if(code === 'INVALID_PASSWORD') {
                    message = 'Invalid password.';
                }
                this.showAlert(message);
            });
        });

    }

    onSwitchAuthMode() {
        this.isLoginMode = !this.isLoginMode;
    }

    onSubmit(loginForm: NgForm) {

        if (loginForm.valid) {
            const email = loginForm.value.email;
            const password = loginForm.value.password;

            this.authenticate(email, password);
        }
    }

    private showAlert(message: string) {
        this.alertController.create({
            header: 'Authentication failed',
            message: message,
            buttons: ['Okay']
        }).then(alertElement => alertElement.present());
    }

}
