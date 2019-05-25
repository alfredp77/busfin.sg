import { Location, LocationServiceApi } from './LocationService';
import { BusStop, BusArrival, NextBusInfo } from '../models/DataMall';
import { apiKey } from './DataMallKey';
import moment from 'moment';
import { delay } from 'q';

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
    private cachedBusStops:BusStop[] = [];

    constructor(private locationService?:LocationServiceApi) {
        
    }

    async getBusArrivals(busStopNumber:string): Promise<BusArrival[]> {
        try {
            const path = `BusArrivalv2?BusStopCode=${busStopNumber}`;
            const response = await this.fetchFromDataMall<DataMallArrivalResponse>(path);
            const now = moment();
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

    async loadAllBusStops(): Promise<BusStop[]> {
        return await this.searchBusStop('');
    }
    async searchBusStop(busStopNumber:string): Promise<BusStop[]> {
        const empty:BusStop[] = [];
        let busStops = empty.concat(this.cachedBusStops);
        if (busStops.length === 0) {
            busStops = await this.fetchPagedData('BusStops', () => true);
        }
        this.cachedBusStops = busStops;
        return busStops.filter( data => {
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

    protected async fetchPagedData<T>(name:string, filter: (arg:T) => boolean): Promise<T[]> {
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

    protected async fetchFromDataMall<T>(path:string): Promise<T>{
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

class FakeLTADataMall extends LTADataMall {
    constructor(locationService?:LocationServiceApi) {
        super(locationService);

    }

    protected async fetchPagedData<T>(name:string, filter: (arg:T) => boolean): Promise<T[]> {
        if (name === 'BusStops') {
            const busStop1:unknown = {
                BusStopCode: '67379',
                RoadName: 'Anchorvale Road',
                Description: 'Opp Blk 313 CP',
                Latitude: 1,
                Longitude: 1
            };

            const busStop2:unknown = {
                BusStopCode: '67381',
                RoadName: 'Sengkang East Way',
                Description: 'Blk 317B',
                Latitude: 1,
                Longitude: 1
            };

            return delay(Promise.resolve([busStop1, busStop2] as T[]), 3000);
        } else {
            return Promise.resolve([]);
        }
    }    

    protected async fetchFromDataMall<T>(path:string): Promise<T>{
        if (path.indexOf('BusArrival') >= 0) {
            const busStop = path.split('=')[1];

            const busInfo1:NextBusInfo = {
                OriginCode: '67000',
                DestinationCode: '67000',
                EstimatedArrival: moment().add(5, "minutes").format(),
                Latitude: 1,
                Longitude: 1,
                VisitNumber: 1,
                Load: "A",
                Feature: "WAB",
                Type: "X"
            }
            const busInfo2:NextBusInfo = {
                OriginCode: '67000',
                DestinationCode: '67000',
                EstimatedArrival: moment().add(16, "minutes").format(),
                Latitude: 1,
                Longitude: 1,
                VisitNumber: 1,
                Load: "A",
                Feature: "WAB",
                Type: "X"
            }
            const busInfo3:NextBusInfo = {
                OriginCode: '67000',
                DestinationCode: '67000',
                EstimatedArrival: moment().add(19, "minutes").format(),
                Latitude: 1,
                Longitude: 1,
                VisitNumber: 1,
                Load: "A",
                Feature: "WAB",
                Type: "X"
            }

            const arrival:BusArrival = {
                ServiceNo: busStop,
                Operator: 'TEST',
                NextBus: busInfo1,
                NextBus2: busInfo2,
                NextBus3: busInfo3
            }

            const response:unknown = {
                BusStopCode: busStop,
                Services: [arrival]
            }

            return delay(Promise.resolve(response as T), 1000);
        } else {
            return Promise.resolve(null as unknown as T);
        }
    }
}

export const ltaDataMall = new LTADataMall();