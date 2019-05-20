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
    NextBus: NextBusInfo
    NextBus2: NextBusInfo
    NextBus3: NextBusInfo
}

export interface NextBusInfo {
    OriginCode: string
    DestinationCode: string
    EstimatedArrival: string
    EstimatedArrivalTime?: Moment
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