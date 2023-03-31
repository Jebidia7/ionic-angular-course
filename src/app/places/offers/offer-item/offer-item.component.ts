import {Component, Input, OnInit} from '@angular/core';
import {Place} from "../../place.model";

@Component({
    selector: 'app-offer-item',
    templateUrl: './offer-item.component.html',
    styleUrls: ['./offer-item.component.scss'],
})
export class OfferItemComponent implements OnInit {


    // @ts-ignore
    @Input() offer: Place;

    constructor() {
    }

    ngOnInit() {
    }

}
