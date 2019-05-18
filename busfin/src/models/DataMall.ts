import { Moment } from 'moment';

export interface BusStop {
    BusStopCode: string,
    RoadName: string,
    Description: string,
    Latitude: number,
    Longitude: number
}

export interface BusArrival {
    ServiceNo: string,
    Operator: string
}

export interface NextBusInfo {
    OriginCode: string,
    DestinationCode: string,
    EstimatedArrival: Moment,
    Latitude: number,
    Longitude: number,
    VisitNumber: number,
    Load: string,
    Feature: string,
    Type: string
}