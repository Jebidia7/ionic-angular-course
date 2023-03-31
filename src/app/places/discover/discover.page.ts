import {Component, OnDestroy, OnInit} from '@angular/core';
import {PlacesService} from "../places.service";
import {Place} from "../place.model";
import {MenuController, SegmentChangeEventDetail} from "@ionic/angular";
import {Subscription, take} from "rxjs";
import {AuthService} from "../../auth/auth.service";

@Component({
    selector: 'app-discover',
    templateUrl: './discover.page.html',
    styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {

    // @ts-ignore
    loadedPlaces: Place[];
    listedLoadedPlaces: Place[] | undefined;
    // @ts-ignore
    relevantPlaces: Place[]
    isLoading = false;
    // @ts-ignore
    placesSubscription: Subscription;

    constructor(
        private authService: AuthService,
        private placesService: PlacesService,
        private menuController: MenuController) {
    }

    ngOnInit() {
        this.placesSubscription = this.placesService.places.subscribe(places => {
            this.loadedPlaces = places;
            this.relevantPlaces = this.loadedPlaces;
            this.listedLoadedPlaces = this.loadedPlaces.slice(1);
        });
    }

    ionViewWillEnter() {
        this.isLoading = true;
        this.placesService.fetchPlaces().subscribe(() => {
            this.isLoading = false;
        });
    }

    ngOnDestroy(): void {
        if (this.placesSubscription) {
            this.placesSubscription.unsubscribe();
        }

    }

    onOpenMenu() {
        this.menuController.toggle();
    }

    onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
        this.authService.userId
        .pipe(take(1))
        .subscribe(userId => {
            if (event.detail.value === 'all') {
                this.relevantPlaces = this.loadedPlaces;
            } else {
                this.relevantPlaces = this.loadedPlaces.filter(place => place.userId !== userId);
            }
            this.listedLoadedPlaces = this.relevantPlaces.slice(1);
        });
    }

}
