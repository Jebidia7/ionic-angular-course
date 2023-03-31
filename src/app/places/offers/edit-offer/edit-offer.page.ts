import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AlertController, LoadingController, NavController} from "@ionic/angular";
import {Place} from "../../place.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {PlacesService} from "../../places.service";

@Component({
    selector: 'app-edit-offer',
    templateUrl: './edit-offer.page.html',
    styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {

    // @ts-ignore
    place: Place;
    // @ts-ignore
    placeId: string;
    // @ts-ignore
    placeSubscription: Subscription;
    isLoading = false;
    // @ts-ignore
    form: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private placesService: PlacesService,
        private navController: NavController,
        private loaderController: LoadingController,
        private alertController: AlertController) {
    }

    ngOnInit() {
        this.route.paramMap.subscribe(paramMap => {
            if (!paramMap.has('placeId')) {
                this.navController.navigateBack('/places/offers');
            } else {
                // @ts-ignore
                this.placeId = paramMap.get('placeId');
                this.isLoading = true;
                // @ts-ignore
                this.placeSubscription = this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => {
                    // @ts-ignore
                    this.place = place;
                    this.form = new FormGroup({
                        title: new FormControl(this.place.title, {
                            updateOn: 'blur',
                            validators: [Validators.required]
                        }),
                        description: new FormControl(this.place.description, {
                            updateOn: 'blur',
                            validators: [Validators.required, Validators.maxLength(180)]
                        })
                    });
                    this.isLoading = false;
                }, error => {
                    this.alertController.create({
                        header: 'An internal error occurred.',
                        message: 'Place could not be found. Please try again later.',
                        buttons: [{
                            text: 'Okay', handler: () => {
                                this.router.navigate(['/places/offers']);
                            }
                        }]
                    }).then(alertElement => {
                        alertElement.present();
                    })
                });
            }
        });
    }

    ngOnDestroy(): void {

        if (this.placeSubscription) {
            this.placeSubscription.unsubscribe();
        }
    }

    onUpdateOffer() {
        if (this.form.valid) {

            this.loaderController.create({
                message: 'Updating place...'
            }).then(loadingElement => {
                loadingElement.present().then();
                this.placesService.updatePlace(
                    this.place.id,
                    this.form.value.title,
                    this.form.value.description
                ).subscribe(() => {
                    loadingElement.dismiss().then();
                    this.form.reset();
                    this.router.navigate(['/', 'places', 'offers']).then();
                });
            });

        }
    }

}
