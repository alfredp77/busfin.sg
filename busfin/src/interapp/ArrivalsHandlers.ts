import { interAppService, InterAppRequest, InterAppResponse, InterAppRequestHandler } from './InterApplicationService'
import { BusStop, ArrivalData } from '../models/DataMall';
import { ltaDataMall } from '../utils/DataMallService';
import { toDictionary } from '../utils/Collections';
import moment from 'moment';

export const ADD_BUS_STOP_ARRIVALS_REQUEST = 'ADD_BUS_STOP_ARRIVALS_REQUEST';
export const GET_BUS_STOP_ARRIVALS_REQUEST = 'GET_BUS_STOP_ARRIVALS_REQUEST';
export const GET_BUS_STOP_ARRIVALS_RESPONSE = 'GET_BUS_STOP_ARRIVALS_RESPONSE';

export interface ArrivalParams {
    busStops: BusStop[]
    arrivals: ArrivalData[]
}

export interface AddBusStopArrivalsRequest extends InterAppRequest {
  BusStop: BusStop
}

export interface GetBusStopArrivalsRequest extends InterAppRequest, ArrivalParams {
}

export interface GetBusStopArrivalsResponse extends InterAppResponse, ArrivalParams {
}

function createResponseTopic(request?:GetBusStopArrivalsRequest) {
    if (request)      
      return `${GET_BUS_STOP_ARRIVALS_RESPONSE}_${request.Id}`;
    return GET_BUS_STOP_ARRIVALS_RESPONSE;
}

export class GetBusStopArrivalsRequestHandler implements InterAppRequestHandler {
    public ltaDataMallService = ltaDataMall;

    constructor(
      private callbackOnInitialize:() => void,
      private callbackOnReady:(errorMsg?:string) => void,
      private showWindow: () => void) {
      this.handleGetBusStopArrivals = this.handleGetBusStopArrivals.bind(this);
    }

    async handleGetBusStopArrivals(request:GetBusStopArrivalsRequest) {
      let response:GetBusStopArrivalsResponse = {
        RequestId: request.Id,
        Error: '',
        busStops: [],
        arrivals: []
      }

      const responseTopic = createResponseTopic(request);
      const generalResponseTopic = createResponseTopic();
      try {
        const existingBusStops = toDictionary(request.arrivals.map(arrival => arrival.BusStop), busStop => busStop.BusStopCode);
        const newBusStops = toDictionary(request.busStops.filter(busStop => !existingBusStops.has(busStop.BusStopCode)), busStop => busStop.BusStopCode);
        const arrivalsMap = toDictionary(request.arrivals, arrival => arrival.Id);

        const arrivals = await Promise.all(request.busStops.map(async (busStop) => {
            const result = await ltaDataMall.getBusArrivals(busStop.BusStopCode);
            return result.map(item => ({
                Id: `${busStop.BusStopCode}-${item.ServiceNo}`,
                BusStop: busStop,
                Arrival: item
            })) as ArrivalData[];
        }));

        let empty:ArrivalData[] = [];
        response.arrivals = empty.concat(...arrivals).filter(arrival => arrivalsMap.has(arrival.Id) || newBusStops.has(arrival.BusStop.BusStopCode));
        let emptyBusStops:BusStop[] = [];
        response.busStops = emptyBusStops.concat(response.arrivals.map(arrival => arrival.BusStop));
        await this.showWindow();
        interAppService.publish(generalResponseTopic, response);
        interAppService.publish(responseTopic, response);
      } catch (e) {
        response.Error = `Failed to fetch bus stop arrivals. Error: ${e}`;
        interAppService.publish(responseTopic, response);
      }
    }

    async initialize() {
      this.callbackOnInitialize();
      interAppService.subscribe(GET_BUS_STOP_ARRIVALS_REQUEST, this.handleGetBusStopArrivals);
      this.callbackOnReady();
    }
}

export class GetBusStopArrivalsRequestSender {
    getArrivals(arrivalParams:ArrivalParams):Promise<GetBusStopArrivalsResponse> {
      const request:GetBusStopArrivalsRequest = {
        ...arrivalParams,
        Id: moment().format('x'), 
      }

      const responseTopic = createResponseTopic(request);
      return new Promise((response, reject) => {
          interAppService.subscribe(responseTopic, (result:GetBusStopArrivalsResponse) => {
          try {
            response(result);
          } catch (e) {
            reject(e);
          }
          finally {
            interAppService.unsubscribe(responseTopic);
          }
        })
        interAppService.publish(GET_BUS_STOP_ARRIVALS_REQUEST, request);
      });
    }
}