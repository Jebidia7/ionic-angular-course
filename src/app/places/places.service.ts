import {Injectable} from '@angular/core';
import {Place} from "./place.model";
import {AuthService} from "../auth/auth.service";
import {BehaviorSubject, map, of, switchMap, take, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";

interface PlaceResponseData {
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    availableFrom: Date;
    availableTo: Date;
    userId: string;
}

@Injectable({
    providedIn: 'root'
})
export class PlacesService {

    private _places = new BehaviorSubject<Place[]>([
        // new Place(
        //     'p1',
        //     'Manhattan Mansion',
        //     'In the heart of NYC',
        //     'https://i.insider.com/5ca27ee3c6cc507737587a95?width=1000&format=jpeg&auto=webp',
        //     149.99,
        //     new Date('2023-02-01'),
        //     new Date('2023-12-31'),
        //     'abc'
        // ),
        // new Place(
        //     'p2',
        //     'London Apartment',
        //     'A simple apartment in London',
        //     'https://media-cdn.tripadvisor.com/media/vr-splice-j/05/91/0b/ee.jpg',
        //     211.99,
        //     new Date('2023-02-01'),
        //     new Date('2023-12-31'),
        //     'abc'
        // ),
        // new Place(
        //     'p3',
        //     'The Foggy Palace',
        //     'Not your average city trip!',
        //     'https://images1.apartments.com/i2/8Bv497kJx2g1OjKGizg_pQnbzbgnkOX0W8AlbDF-YNQ/117/33-tehama-san-francisco-ca-building-photo.jpg',
        //     99.99,
        //     new Date('2023-02-01'),
        //     new Date('2023-12-31'),
        //     'abc'
        // )
    ]);

    constructor(private authService: AuthService, private httpClient: HttpClient) {
    }

    get places() {
        return this._places.asObservable();
    }

    fetchPlaces() {
        return this.httpClient
        .get<{ [key: string]: PlaceResponseData }>('https://ionic-angular-course-11307-default-rtdb.firebaseio.com/offered-places.json')
        .pipe(
            map(responseData => {
                const places = [];
                for (const key in responseData) {
                    if (responseData.hasOwnProperty(key)) {
                        places.push(new Place(
                            key,
                            responseData[key].title,
                            responseData[key].description,
                            responseData[key].imageUrl,
                            responseData[key].price,
                            new Date(responseData[key].availableFrom),
                            new Date(responseData[key].availableTo),
                            responseData[key].userId
                        ))
                    }
                }
                return places;
            }),
            tap(places => {
                this._places.next(places);
            })
        );
    }

    getPlace(id: string) {
        return this.httpClient.get<PlaceResponseData>(`https://ionic-angular-course-11307-default-rtdb.firebaseio.com/offered-places/${id}.json`)
        .pipe(
            map(placeData => {
                return new Place(
                    id,
                    placeData.title,
                    placeData.description,
                    placeData.imageUrl,
                    placeData.price,
                    new Date(placeData.availableFrom),
                    new Date(placeData.availableTo),
                    placeData.userId
                )
            })
        );
    }

    addPlace(title: string, description: string, price: number, availableFrom: Date, availableTo: Date) {

        let generatedId: string;
        let responseId: string;
        let newPlace: Place;

        return this.authService.userId.pipe(
            take(1),
            // @ts-ignore
            switchMap(userId => {
                if (!userId) {
                    throw new Error('No user found!');
                }
                newPlace = new Place(
                    Math.random().toString(),
                    title,
                    description,
                    'https://images1.apartments.com/i2/8Bv497kJx2g1OjKGizg_pQnbzbgnkOX0W8AlbDF-YNQ/117/33-tehama-san-francisco-ca-building-photo.jpg',
                    price,
                    availableFrom,
                    availableTo,
                    userId
                );

                return this.httpClient.post<{ name: string }>(
                    'https://ionic-angular-course-11307-default-rtdb.firebaseio.com/offered-places.json',
                    {...newPlace, id: null})
            }),
            switchMap(responseData => {
                responseId = responseData.name;
                return this.places;
            }),
            take(1),
            tap(places => {
                newPlace.id = responseId;
                this._places.next(places.concat(newPlace))
            })
        );
    }

    updatePlace(placeId: string, title: string, description: string) {
        let updatedPlaces: Place[];
        return this.places.pipe(
            take(1),
            switchMap(places => {
                if (!places || places.length === 0) {
                    return this.fetchPlaces();
                } else {
                    return of(places);
                }
            }),
            switchMap(places => {
                const place = places.find(place => place.id === placeId);
                const newPlace = {...place}
                newPlace.title = title;
                newPlace.description = description;
                // @ts-ignore
                updatedPlaces = [...places.filter(place => place.id !== placeId)].concat(newPlace)
                return this.httpClient.put(
                    `https://ionic-angular-course-11307-default-rtdb.firebaseio.com/offered-places/${placeId}.json`,
                    {...newPlace, id: null});
            }),
            tap(response => {
                console.log("http PUT response", response);
                console.log("Updated offers", updatedPlaces);
                this._places.next(updatedPlaces);
            })
        );
    }
}
