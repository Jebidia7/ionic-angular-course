import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {PlacesService} from "../places.service";
import {Place} from "../place.model";
import {Subscription, take} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class OffersService implements OnInit, OnDestroy {

    // @ts-ignore
    private _offers: Place[];
    // @ts-ignore
    private placesSubscription: Subscription;

    constructor(private placesService: PlacesService) {
    }

    ngOnInit() {
        this.placesSubscription = this.placesService.places.subscribe(places => {
            this._offers = places;
        });
    }

    ngOnDestroy(): void {
        if (this.placesSubscription) {
            this.placesSubscription.unsubscribe();
        }
    }


    get offers() {
        return this.placesService.places;
    }

    fetchOffers() {
        return this.placesService.fetchPlaces();
    }

    getOffer(id: string) {
        return this.placesService.getPlace(id);
    }

    addOffer(title: string, description: string, price: number, availableFrom: Date, availableTo: Date) {

        this.placesService.addPlace(title, description, price, availableFrom, availableTo)
    }
}
