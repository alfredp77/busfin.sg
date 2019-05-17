export interface Location {
    latitude: number,
    longitude: number
}

export interface LocationServiceApi {
    distance (point1:Location, point2:Location): number;
}