import { InterApplicationService, InterAppRequest, InterAppResponse, InterAppRequestHandler } from './InterApplicationService'
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
    public interAppService = InterApplicationService.getInstance();
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
        this.interAppService.publish(responseTopic, response);
      } catch (e) {
        response.Error = `Failed to fetch bus stops. Error: ${e}`;
        this.interAppService.publish(responseTopic, response);
      }
    }

    async initialize() {
      this.callbackOnInitialize();

      try {
        await this.ltaDataMallService.loadAllBusStops();
        this.interAppService.subscribe(GET_BUS_STOPS_REQUEST, this.handleGetBusStops)

        this.callbackOnReady();
      } catch (e) {
        this.callbackOnReady(`Failed to fetch bus stops. Error: ${e}`);
      }
    }
}

export class GetBusStopsRequestSender {
  public interAppService = InterApplicationService.getInstance();

  getBusStops(nearest:boolean, busStopCode:string, onResponse:(response:GetBusStopsResponse) => void) {
    const request:GetBusStopsRequest = {
      Id: moment().format('x'), 
      Nearest: nearest,
      BusStopCode: busStopCode
    }

    const responseTopic = createResponseTopic(request);
    this.interAppService.subscribe(responseTopic, (response:GetBusStopsResponse) => {
      try {
        onResponse(response);
      } finally {
        this.interAppService.unsubscribe(responseTopic);
      }
    })
    this.interAppService.publish(GET_BUS_STOPS_REQUEST, request);    
  }  

  getBusStops2(nearest:boolean, busStopCode:string):Promise<GetBusStopsResponse> {
    const request:GetBusStopsRequest = {
      Id: moment().format('x'), 
      Nearest: nearest,
      BusStopCode: busStopCode
    }

    const responseTopic = createResponseTopic(request);
    return new Promise((response, reject) => {
      this.interAppService.subscribe(responseTopic, (result:GetBusStopsResponse) => {
        try {
          response(result);
        } catch (e) {
          reject(e);
        }
        finally {
          this.interAppService.unsubscribe(responseTopic);
        }
      })
      this.interAppService.publish(GET_BUS_STOPS_REQUEST, request);
    });
  }
}

