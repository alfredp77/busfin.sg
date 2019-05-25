import { InterApplicationService, InterAppRequest, InterAppResponse, InterAppRequestHandler } from './InterApplicationService'
import { BusStop, ArrivalData } from '../models/DataMall';
import { ltaDataMall } from '../utils/DataMallService';
import { toDictionary } from '../utils/Collections';
import moment from 'moment';

export const GET_BUS_STOP_ARRIVALS_REQUEST = 'GET_BUS_STOP_ARRIVALS_REQUEST';
export type GET_BUS_STOP_ARRIVALS_REQUEST = typeof GET_BUS_STOP_ARRIVALS_REQUEST;

export const GET_BUS_STOP_ARRIVALS_RESPONSE = 'GET_BUS_STOP_ARRIVALS_RESPONSE';
export type GET_BUS_STOP_ARRIVALS_RESPONSE = typeof GET_BUS_STOP_ARRIVALS_RESPONSE;

export interface ArrivalParams {
    BusStops: BusStop[]
    Arrivals: ArrivalData[]
}

export interface GetBusStopArrivalsRequest extends InterAppRequest, ArrivalParams {
}

export interface GetBusStopArrivalsResponse extends InterAppResponse, ArrivalParams {
}

function createResponseTopic(request:GetBusStopArrivalsRequest) {
    return `${GET_BUS_STOP_ARRIVALS_REQUEST}_${request.Id}`;
}

export class GetBusStopArrivalsRequestHandler implements InterAppRequestHandler {
    public interAppService = InterApplicationService.getInstance();
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
        BusStops: [],
        Arrivals: []
      }

      const responseTopic = createResponseTopic(request);
      try {
        const existingBusStops = toDictionary(request.Arrivals.map(arrival => arrival.BusStop), busStop => busStop.BusStopCode);
        const newBusStops = toDictionary(request.BusStops.filter(busStop => !existingBusStops.has(busStop.BusStopCode)), busStop => busStop.BusStopCode);
        const arrivalsMap = toDictionary(request.Arrivals, arrival => arrival.Id);

        const arrivals = await Promise.all(request.BusStops.map(async (busStop) => {
            const result = await ltaDataMall.getBusArrivals(busStop.BusStopCode);
            return result.map(item => ({
                Id: `${busStop.BusStopCode}-${item.ServiceNo}`,
                BusStop: busStop,
                Arrival: item
            })) as ArrivalData[];
        }));

        let empty:ArrivalData[] = [];
        response.Arrivals = empty.concat(...arrivals).filter(arrival => arrivalsMap.has(arrival.Id) || newBusStops.has(arrival.BusStop.BusStopCode));
        let emptyBusStops:BusStop[] = [];
        response.BusStops = emptyBusStops.concat(response.Arrivals.map(arrival => arrival.BusStop));
        await this.showWindow();
        this.interAppService.publish(responseTopic, response);
      } catch (e) {
        response.Error = `Failed to fetch bus stop arrivals. Error: ${e}`;
        this.interAppService.publish(responseTopic, response);
      }
    }

    async initialize() {
      this.callbackOnInitialize();
      this.interAppService.subscribe(GET_BUS_STOP_ARRIVALS_REQUEST, this.handleGetBusStopArrivals);
      this.callbackOnReady();
    }
}

export class GetBusStopArrivalsRequestSender {
    public interAppService = InterApplicationService.getInstance();
  
    getArrivals(arrivalParams:ArrivalParams, onResponse:(response:GetBusStopArrivalsResponse) => void) {
      const request:GetBusStopArrivalsRequest = {
        ...arrivalParams,
        Id: moment().format('x'), 
      }
  
      const responseTopic = createResponseTopic(request);
      this.interAppService.subscribe(responseTopic, (response:GetBusStopArrivalsResponse) => {
        try {
          onResponse(response);
        } finally {
          this.interAppService.unsubscribe(responseTopic);
        }
      })
      this.interAppService.publish(GET_BUS_STOP_ARRIVALS_REQUEST, request);    
    }  
  }