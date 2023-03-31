import {Component, OnDestroy, OnInit} from '@angular/core';
import {Place} from "../place.model";
import {OffersService} from "./offers.service";
import {IonItemSliding} from "@ionic/angular";
import {Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-offers',
    templateUrl: './offers.page.html',
    styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {

    // @ts-ignore
    activeOffers: Place[];
    isLoading = false;
    // @ts-ignore
    offersSubscription: Subscription;

    constructor(private offersService: OffersService, private router: Router) {
    }

    ngOnInit() {
        this.offersSubscription = this.offersService.offers.subscribe(offers => {
            this.activeOffers = offers;
        });
    }

    ngOnDestroy(): void {
        if (this.offersSubscription) {
            this.offersSubscription.unsubscribe();
        }
    }

    ionViewWillEnter() {
        this.isLoading = true;
        this.offersService.fetchOffers().subscribe(() => {
            this.isLoading = false;
        });
    }

    onEdit(offerId: string, slidingItem: IonItemSliding) {
        slidingItem.close().then();
        this.router.navigate(['/', 'places', 'offers', 'edit', offerId]);
        console.log('Editing item...', offerId);
    }

}
