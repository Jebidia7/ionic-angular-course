import {Component, OnDestroy, OnInit} from '@angular/core';
import {BookingService} from "./booking.service";
import {Booking} from "./booking.model";
import {IonItemSliding, LoadingController} from "@ionic/angular";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-bookings',
    templateUrl: './bookings.page.html',
    styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {

    loadedBookings: Booking[] = [];

    isLoading = false;

    bookingsSubscription: Subscription | undefined;

    constructor(private bookingsService: BookingService, private loadingController: LoadingController) {
    }

    ngOnInit() {
        this.bookingsSubscription = this.bookingsService.bookings.subscribe(bookings => {
            this.loadedBookings = bookings;
        });
    }

    ionViewWillEnter() {
        this.isLoading = true;
        this.bookingsService.fetchBookings().subscribe(() => {
            this.isLoading = false;
        });
    }

    ngOnDestroy(): void {
        this.bookingsSubscription?.unsubscribe();
    }

    onCancelBooking(bookingId: string, slidingElement: IonItemSliding) {
        slidingElement.close().then();
        this.loadingController.create({message: 'Cancelling booking...'}).then(loadingElement => {
            loadingElement.present();
            this.bookingsService.cancelBooking(bookingId).subscribe(() => {
                loadingElement.dismiss().then();
            })
        });
    }
}
