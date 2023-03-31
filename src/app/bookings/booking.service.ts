import {Injectable} from "@angular/core";
import {Booking} from "./booking.model";
import {BehaviorSubject, map, switchMap, take, tap} from "rxjs";
import {AuthService} from "../auth/auth.service";
import {HttpClient} from "@angular/common/http";

interface BookingResponseData {
    placeId: string;
    userId: string;
    placeTitle: string;
    placeImage: string;
    firstName: string;
    lastName: string;
    guestNumber: number;
    bookedFrom: Date;
    bookedTo: Date;
}

@Injectable({providedIn: 'root'})
export class BookingService {

    private _bookings = new BehaviorSubject<Booking[]>([]);

    constructor(
        private authService: AuthService,
        private httpClient: HttpClient) {
    }

    get bookings() {
        return this._bookings.asObservable();
    }

    addBooking(placeId: string, plateTitle: string,
        placeImage: string, firstName: string,
        lastName: string, guestNumber: number,
        dateFrom: Date, dateTo: Date) {

        let generatedId: string;
        let newBooking: Booking;

        return this.authService.userId
        .pipe(
            take(1),
            // @ts-ignore
            switchMap(userId => {
                if (!userId) {
                    throw new Error('No user id found!');
                }
                newBooking = new Booking(
                    Math.random().toString(),
                    placeId,
                    userId,
                    plateTitle,
                    placeImage,
                    firstName,
                    lastName,
                    guestNumber,
                    dateFrom,
                    dateTo);
                return this.httpClient.post<{ name: string }>(
                    'https://ionic-angular-course-11307-default-rtdb.firebaseio.com/bookings.json',
                    {...newBooking, id: null}
                );
            }),
            switchMap(responseData => {
                generatedId = responseData.name;
                return this.bookings;
            }),
            take(1),
            tap(bookings => {
                newBooking.id = generatedId;
                this._bookings.next(bookings.concat(newBooking));
            })
        );
    }

    cancelBooking(bookingId: string) {

        return this.httpClient.delete(
            `https://ionic-angular-course-11307-default-rtdb.firebaseio.com/bookings/${bookingId}.json`
        ).pipe(
            switchMap(() => {
                return this.bookings;
            }),
            take(1),
            tap(bookings => {
                this._bookings.next(bookings.filter(booking => booking.id !== bookingId));
            })
        );

        // return this.bookings.pipe(
        //     take(1),
        //     delay(1000),
        //     tap(bookings => {
        //         this._bookings.next(bookings.filter(booking => booking.id !== bookingId));
        //     })
        // );
    }

    fetchBookings() {
        return this.authService.userId.pipe(
            take(1),
            switchMap(userId => {
                if (!userId) {
                    throw new Error('User not found!');
                }
                return this.httpClient.get<{ [key: string]: BookingResponseData }>(
                    `https://ionic-angular-course-11307-default-rtdb.firebaseio.com/bookings.json?orderBy="userId"&equalTo="${userId}"`
                )
            }),
            map(responseData => {
                const bookings = [];
                for (const key in responseData) {
                    if (responseData.hasOwnProperty(key)) {
                        bookings.push(new Booking(
                            key,
                            responseData[key].placeId,
                            responseData[key].userId,
                            responseData[key].placeTitle,
                            responseData[key].placeImage,
                            responseData[key].firstName,
                            responseData[key].lastName,
                            responseData[key].guestNumber,
                            new Date(responseData[key].bookedFrom),
                            new Date(responseData[key].bookedTo)
                        ));
                    }
                }

                return bookings;
            }),
            tap(bookings => {
                this._bookings.next(bookings);
            })
        );
    }
}