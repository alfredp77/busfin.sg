import { Location, LocationServiceApi } from './LocationService';
import { BusStop, BusArrival } from '../models/DataMall';
import moment from 'moment';

const apiKey='j+7DlElbSw2PA5AzgeAtZA==';
const headers = {
    "AccountKey": apiKey,
    "accept":"application/json"
}
const baseUrl = 'http://datamall2.mytransport.sg/ltaodataservice/';

interface DataMallPagedResponse<T> {
    value: T[]
}

interface DataMallArrivalResponse {
    BusStopCode: string,
    Services: BusArrival[]
}

export class LTADataMall {
    constructor(private locationService?:LocationServiceApi) {
        
    }

    async getBusArrivals(busStopNumber:string): Promise<BusArrival[]> {
        try {
            const path = `BusArrivalv2?BusStopCode=${busStopNumber}`;
            const response = await this.fetchFromDataMall<DataMallArrivalResponse>(path);
            const now = moment();
            console.log(JSON.stringify(response.Services));
            return response.Services.map(s => {
                s.NextBus.EstimatedArrivalTime = moment(s.NextBus.EstimatedArrival);
                s.NextBus2.EstimatedArrivalTime = moment(s.NextBus2.EstimatedArrival);
                s.NextBus3.EstimatedArrivalTime = moment(s.NextBus3.EstimatedArrival);

                s.NextBus.EstimatedArrivalInMins = s.NextBus.EstimatedArrivalTime.diff(now, "minutes");
                s.NextBus2.EstimatedArrivalInMins = s.NextBus2.EstimatedArrivalTime.diff(now, "minutes");
                s.NextBus3.EstimatedArrivalInMins = s.NextBus3.EstimatedArrivalTime.diff(now, "minutes");
                return s;
            });
        } catch (e) {
            console.log(`Failed to fetch bus arrival:${e}`);
            return [];
        }
    }

    async searchBusStop(busStopNumber:string): Promise<BusStop[]> {
        return await this.fetchPagedData('BusStops', data => {
            if (busStopNumber === '' || (data.BusStopCode && data.BusStopCode.startsWith(busStopNumber)))
                return true;
            return false;
        });
    }

    // async searchNearbyBusStops(latitude:number, longitude:number, maxDistance:number): Promise<BusStop[]> {
    //     if (this.locationService == undefined) {
    //         return Promise.resolve([]);
    //     }

    //     const location:Location = {latitude, longitude};
    //     return await this.fetchData('BusStops', data => {
    //         const busStopLocation:Location = {
    //             latitude:data.Latitude, 
    //             longitude:data.Longitude
    //         };
    //         const distance = this.locationService.distance(location, busStopLocation);
    //         return distance < maxDistance;
    //     });
    // }

    private async fetchPagedData<T>(name:string, filter: (arg:T) => boolean): Promise<T[]> {
        const skipCount = 500;
        let currentSkip = 0;
        let lastRetrievedCount = 0;
        let result:T[] = [];
        
        while (lastRetrievedCount === 0 || lastRetrievedCount >= skipCount) {
            let path = currentSkip === 0 ? name : `${name}?$skip=${currentSkip}`;
            const response = await this.fetchFromDataMall<DataMallPagedResponse<T>>(path);
            const items = response.value;
            console.log(items);
            const filtered = items.filter(filter);
            result = result.concat(filtered)
            lastRetrievedCount=items.length;
            currentSkip+=skipCount;            
        }
        return result;
    }

    private async fetchFromDataMall<T>(path:string): Promise<T>{
        let endpoint = `https://cors-anywhere.herokuapp.com/${baseUrl}${path}`;
        let response = await fetch(endpoint, {
            method: 'GET',
            headers: headers
        })
        if (!response.ok) {
            throw new Error('Unable to find data');
        } 

        return await response.json() as T;
    }
}

export const ltaDataMall = new LTADataMall();