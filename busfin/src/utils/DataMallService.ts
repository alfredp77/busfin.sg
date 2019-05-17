import { Location, LocationServiceApi } from './LocationService';
import { BusStop } from '../models/BusStop';

const apiKey='j+7DlElbSw2PA5AzgeAtZA==';
const headers = {
    "AccountKey": apiKey,
    "accept":"application/json"
}
const baseUrl = 'http://datamall2.mytransport.sg/ltaodataservice/';

interface DataMallResponse<T> {
    value: T[]
}

export class LTADataMall {
    constructor(private locationService?:LocationServiceApi) {
        
    }

    async searchBusStop(busStopNumber:string): Promise<BusStop[]> {
        return await this.fetchData('BusStops', data => {
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

    private async fetchData<T>(name:string, filter: (arg:T) => boolean): Promise<T[]> {
        const skipCount = 500;
        let currentSkip = 0;
        let lastRetrievedCount = 0;
        let result:T[] = [];
        let url = `${baseUrl}${name}`;
        let corsSafe = `https://cors-anywhere.herokuapp.com/${url}`
        while (lastRetrievedCount === 0 || lastRetrievedCount >= skipCount) {
            let endpoint = currentSkip === 0 ? corsSafe : `${corsSafe}?$skip=${currentSkip}`;
            let response = await fetch(endpoint, {
                method: 'GET',
                headers: headers
            })
            if (response.ok) {
                const jsonResponse = await response.json() as DataMallResponse<T>;
                const items = jsonResponse.value;
                console.log(items);
                const filtered = items.filter(filter);
                result = result.concat(filtered)
                lastRetrievedCount=items.length;
                currentSkip+=skipCount;
            } else {
                throw new Error('Unable to find data');
            }
        }
        return result;
    }
}

export const ltaDataMall = new LTADataMall();