import {Component} from '@angular/core';
import {AuthService} from "./auth/auth.service";
import {Router} from "@angular/router";
import {Platform} from "@ionic/angular";
import {Capacitor} from "@capacitor/core";
import {SplashScreen} from "@capacitor/splash-screen";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
})
export class AppComponent {
    constructor(
        private platform: Platform,
        private authService: AuthService,
        private router:Router) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
           if(Capacitor.isPluginAvailable('SplashScreen')) {
                SplashScreen.hide();
           }
        });
    }

    onLogout() {
        this.authService.logout();
        this.router.navigateByUrl('/auth');
    }
}
