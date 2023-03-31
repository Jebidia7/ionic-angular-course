import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Place} from "../../places/place.model";
import {ModalController} from "@ionic/angular";
import {NgForm} from "@angular/forms";
import {BookingService} from "../booking.service";

@Component({
    selector: 'app-create-booking',
    templateUrl: './create-booking.component.html',
    styleUrls: ['./create-booking.component.scss'],
})
export class CreateBookingComponent implements OnInit {

    // @ts-ignore
    @Input() selectedPlace: Place;
    // @ts-ignore
    @Input() selectedMode: 'select' | 'random';
    // @ts-ignore
    @ViewChild('form', {static: true}) form: NgForm;
    // @ts-ignore
    startDate: string;
    // @ts-ignore
    endDate: string;

    constructor(private modalController: ModalController, private bookingService: BookingService) {
    }

    ngOnInit() {
        const availableFrom = new Date(this.selectedPlace.availableFrom);
        const availableTo = new Date(this.selectedPlace.availableTo);
        if (this.selectedMode === 'random') {
            this.startDate =
                new Date(availableFrom.getTime() + Math.random() *
                    (availableTo.getTime() - 7 * 24 * 60 * 60 * 1000 - availableFrom.getTime())
                ).toISOString();

            this.endDate = new Date(new Date(this.startDate).getTime() + Math.random() *
                (new Date(this.startDate).getTime() + 6 * 24 * 60 * 60 * 1000 - new Date(this.startDate).getTime())
            ).toISOString();
        }
    }

    onCancel() {
        this.modalController.dismiss(null, 'cancel').then();
    }

    onBookPlace() {
        if (this.form.valid && this.datesValid()) {

            this.modalController.dismiss({
                bookingData: {
                    firstName: this.form.value['first-name'],
                    lastName: this.form.value['last-name'],
                    guestNumber: +this.form.value['guest-number'],
                    startDate: new Date(this.form.value['date-from']),
                    endDate: new Date(this.form.value['date-to'])
                }
            }, 'confirm').then();
        }
    }

    datesValid() {
        const startDate = new Date(this.form.value['date-from']);
        const endDate = new Date(this.form.value['date-to']);
        return endDate > startDate;
    }

}
