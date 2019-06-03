import * as React from 'react';
import * as enzyme from 'enzyme';
import { GetBusStopsRequestHandler, GET_BUS_STOPS_REQUEST, GetBusStopsRequest, GetBusStopsResponse, GET_BUS_STOPS_RESPONSE } from './BusStopsHandlers';
import { BusStop } from '../models/DataMall';

import { interAppService } from '../interapp/InterApplicationService';
import { ltaDataMall } from '../utils/DataMallService';

jest.mock('../utils/DataMallService');
jest.mock('./InterApplicationService');

describe('GetBusStopRequestHandlerTests', () => {
    let handler:GetBusStopsRequestHandler;
    let callbackOnInitialize:() => void;
    let callbackOnReady:(errorMsg?:string) => void;

    beforeEach(() => {        
        //@ts-ignore
        interAppService.publish.mockReset();
        callbackOnInitialize = jest.fn();
        callbackOnReady = jest.fn();
        handler = new GetBusStopsRequestHandler(callbackOnInitialize, callbackOnReady);
    });

    it('should call callbackOnInitialize when starting initialization', async () => {
        await handler.initialize();
        expect(callbackOnInitialize).toBeCalled();
    });

    it('should loadAllBusStops when initializing', async() => {
        await handler.initialize();
        expect(ltaDataMall.loadAllBusStops).toBeCalled();
    });

    it('should subscribe to GET_BUS_STOPS_REQUEST when initializing', async() => {
        await handler.initialize();
        expect(interAppService.subscribe).toBeCalledWith(GET_BUS_STOPS_REQUEST, handler.handleGetBusStops);
    });

    it('handleGetBusStops should publish busstops from lta data mall service',async() => {    
        const busStop1:BusStop = {
            BusStopCode: 'abc',
            RoadName: 'road 1',
            Description: 'test 1',
            Latitude: 1,
            Longitude: 1
        }
        const busStop2:BusStop = {
            BusStopCode: 'def',
            RoadName: 'road 2',
            Description: 'test 2',
            Latitude: 2,
            Longitude: 2
        }
        const mockedResult:BusStop[] = [
            busStop1, busStop2
        ]    
        //@ts-ignore
        ltaDataMall.searchBusStop.mockResolvedValueOnce(mockedResult);

        const request:GetBusStopsRequest = {
            Id: 'blah',
            Nearest: false,
            BusStopCode: 'abc'
        };

        await handler.handleGetBusStops(request);

        //@ts-ignore
        const topic = interAppService.publish.mock.calls[0][0] as string;
        expect(topic).toEqual(`${GET_BUS_STOPS_RESPONSE}_blah`)
        //@ts-ignore
        const response = interAppService.publish.mock.calls[0][1] as GetBusStopsResponse;
        expect(response.BusStops).toContain(busStop1);
        expect(response.BusStops).toContain(busStop2);
    });

    it('handleGetBusStops should publish error when searchBusStop fails', async() => {
        //@ts-ignore
        ltaDataMall.searchBusStop.mockRejectedValueOnce('error!');

        const request:GetBusStopsRequest = {
            Id: 'blah-1',
            Nearest: false,
            BusStopCode: 'abc'
        };

        await handler.handleGetBusStops(request);

        //@ts-ignore
        const topic = interAppService.publish.mock.calls[0][0] as string;
        expect(topic).toEqual(`${GET_BUS_STOPS_RESPONSE}_blah-1`)
        //@ts-ignore
        const response = interAppService.publish.mock.calls[0][1] as GetBusStopsResponse;
        expect(response.Error).toEqual('Failed to fetch bus stops. Error: error!');
    });
})
