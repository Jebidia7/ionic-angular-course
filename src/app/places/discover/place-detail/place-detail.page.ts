import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActionSheetController, AlertController, LoadingController, ModalController, NavController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {PlacesService} from "../../places.service";
import {Place} from "../../place.model";
import {CreateBookingComponent} from "../../../bookings/create-booking/create-booking.component";
import {Subscription, switchMap} from "rxjs";
import {BookingService} from "../../../bookings/booking.service";
import {AuthService} from "../../../auth/auth.service";

@Component({
    selector: 'app-place-detail',
    templateUrl: './place-detail.page.html',
    styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {

    // @ts-ignore
    place: Place;
    isBookable = true;
    isLoading = false;
    // @ts-ignore
    placeSubscription: Subscription;

    constructor(
        private navController: NavController,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private placesService: PlacesService,
        private bookingService: BookingService,
        private alertController: AlertController,
        private modalController: ModalController,
        private loadingController: LoadingController,
        private actionSheetController: ActionSheetController) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(paramMap => {
            if (!paramMap.has('placeId')) {
                this.navController.navigateBack('/places/discover');
            } else {
                this.isLoading = true;
                let fetchedUserId: string;
                this.authService.userId.pipe(
                    switchMap(userId => {
                        if (!userId) {
                            throw new Error('Found no user!');
                        }
                        fetchedUserId = userId;
                        // @ts-ignore
                        return this.placesService.getPlace(paramMap.get('placeId'));
                    })
                )
                .subscribe(place => {
                    // @ts-ignore
                    this.place = place;
                    this.isBookable = place.userId !== fetchedUserId;
                    this.isLoading = false;
                }, error => {
                    this.alertController.create({
                        header: 'An error occurred',
                        message: 'Could not load place.',
                        buttons: [{
                            text: 'Okay',
                            handler: () => {
                                this.router.navigate(['/places/discover']);
                            }
                        }]
                    }).then(alertElement => alertElement.present().then());
                });
            }
        })
    }

    ngOnDestroy(): void {

        if (this.placeSubscription) {
            this.placeSubscription.unsubscribe();
        }
    }


    onBookPlace() {
        //this.navController.navigateBack('/places/offers');
        this.actionSheetController.create({
            header: 'Choose an Action',
            buttons: [
                {
                    text: 'Select Date',
                    handler: () => {
                        this.openBookingModal('select');
                    }
                },
                {
                    text: 'Random Date',
                    handler: () => {
                        this.openBookingModal('random');
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel'
                }
            ]
        }).then(actionSheetElement => {
            actionSheetElement.present().then();
        });

    }

    private openBookingModal(mode: 'select' | 'random') {
        console.log(mode);
        this.modalController.create({
            component: CreateBookingComponent,
            componentProps: {selectedPlace: this.place, selectedMode: mode}
        })
        .then(modelElement => {
            modelElement.present().then();
            return modelElement.onDidDismiss();
        })
        .then(resultData => {
            console.log(resultData.data, resultData.role);
            if (resultData.role === 'confirm') {
                this.loadingController.create({
                    message: 'Booking place...'
                }).then(loadingElement => {
                    loadingElement.present().then();
                    const bookingData = resultData.data.bookingData;
                    this.bookingService.addBooking(
                        this.place.id,
                        this.place.title,
                        this.place.imageUrl,
                        bookingData.firstName,
                        bookingData.lastName,
                        bookingData.guestNumber,
                        bookingData.startDate,
                        bookingData.endDate
                    ).subscribe(() => {
                        loadingElement.dismiss().then();
                    });
                });
            }
        });
    }

}
