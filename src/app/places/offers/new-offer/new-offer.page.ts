import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {PlacesService} from "../../places.service";
import {Router} from "@angular/router";
import {LoadingController} from "@ionic/angular";

@Component({
    selector: 'app-new-offer',
    templateUrl: './new-offer.page.html',
    styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {

    // @ts-ignore
    form: FormGroup;

    constructor(
        private placesService: PlacesService,
        private router: Router,
        private loaderController: LoadingController) {
    }

    ngOnInit() {
        this.form = new FormGroup({
            title: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required]
            }),
            description: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(180)]
            }),
            price: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.min(1)]
            }),
            dateFrom: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required]
            }),
            dateTo: new FormControl(null, {
                updateOn: 'blur',
                validators: [Validators.required]
            })
        });
    }

    onCreateOffer() {
        if (this.form.valid) {

            this.loaderController.create({
                message: 'Creating place...'
            }).then(loadingElement => {
                loadingElement.present().then();
                this.placesService.addPlace(
                    this.form.value.title,
                    this.form.value.description,
                    +this.form.value.price,
                    new Date(this.form.value.dateFrom),
                    new Date(this.form.value.dateTo)
                ).subscribe(() => {
                    loadingElement.dismiss().then();
                    this.form.reset();
                    this.router.navigate(['/', 'places', 'offers']).then();
                });
            });

        }
    }

}
