import { InterAppRequest, InterAppResponse, InterAppRequestHandler, interAppService} from './InterApplicationService'
import { BusStop } from '../models/DataMall';
import { ltaDataMall } from '../utils/DataMallService';
import moment from 'moment';

export const GET_BUS_STOPS_REQUEST = 'GET_BUS_STOPS_REQUEST';
export type GET_BUS_STOPS_REQUEST = typeof GET_BUS_STOPS_REQUEST;

export const GET_BUS_STOPS_RESPONSE = 'GET_BUS_STOPS_RESPONSE';
export type GET_BUS_STOPS_RESPONSE = typeof GET_BUS_STOPS_RESPONSE;

export interface GetBusStopsRequest extends InterAppRequest {
    Nearest: boolean
    BusStopCode: string
}

export interface GetBusStopsResponse extends InterAppResponse {
    BusStops: BusStop[]
}

function createResponseTopic(request:GetBusStopsRequest) {
  return `${GET_BUS_STOPS_RESPONSE}_${request.Id}`;
}

export class GetBusStopsRequestHandler implements InterAppRequestHandler {
    public ltaDataMallService = ltaDataMall;

    constructor(
      private callbackOnInitialize:() => void,
      private callbackOnReady:(errorMsg?:string) => void) {
      this.handleGetBusStops = this.handleGetBusStops.bind(this);
    }

    async handleGetBusStops(request:GetBusStopsRequest) {
      let response:GetBusStopsResponse = {
        RequestId: request.Id,
        Error: '',
        BusStops: []
      }

      const responseTopic = createResponseTopic(request);
      try {
        response.BusStops = await this.ltaDataMallService.searchBusStop(request.BusStopCode);
        interAppService.publish(responseTopic, response);
      } catch (e) {
        response.Error = `Failed to fetch bus stops. Error: ${e}`;
        interAppService.publish(responseTopic, response);
      }
    }
    
    async initialize() {
      this.callbackOnInitialize();

      try {
        await this.ltaDataMallService.loadAllBusStops();
        interAppService.subscribe(GET_BUS_STOPS_REQUEST, this.handleGetBusStops)

        this.callbackOnReady();
      } catch (e) {
        this.callbackOnReady(`Failed to fetch bus stops. Error: ${e}`);
      }
    }
}

export class GetBusStopsRequestSender {
  
  getBusStops(nearest:boolean, busStopCode:string):Promise<GetBusStopsResponse> {
    const request:GetBusStopsRequest = {
      Id: moment().format('x'), 
      Nearest: nearest,
      BusStopCode: busStopCode
    }

    const responseTopic = createResponseTopic(request);
    return new Promise((response, reject) => {
        interAppService.subscribe(responseTopic, (result:GetBusStopsResponse) => {
        try {
          response(result);
        } catch (e) {
          reject(e);
        }
        finally {
          interAppService.unsubscribe(responseTopic);
        }
      })
      interAppService.publish(GET_BUS_STOPS_REQUEST, request);
    });
  }
}

