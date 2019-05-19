import { Moment } from 'moment';

export interface BusStop {
    BusStopCode: string
    RoadName: string
    Description: string
    Latitude: number
    Longitude: number
}

export interface BusArrival {
    ServiceNo: string
    Operator: string
    NextBus: NextBusInfo[]
}

export interface NextBusInfo {
    OriginCode: string
    DestinationCode: string
    EstimatedArrival: Moment
    EstimatedArrivalInMins?: number
    Latitude: number
    Longitude: number
    VisitNumber: number
    Load: string
    Feature: string
    Type: string
}

export interface ArrivalData {
    Id: string 
    BusStop: BusStop
    Arrival: BusArrival
}