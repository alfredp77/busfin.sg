import * as React from 'react';
import * as enzyme from 'enzyme';
import { GetBusStopsRequestHandler, GET_BUS_STOPS_REQUEST } from './BusStopsHandlers';

jest.mock('../utils/DataMallService');
jest.mock('./InterApplicationService');

import { InterApplicationService } from '../interapp/InterApplicationService';

describe('GetBusStopRequestHandlerTests', () => {
    let handler:GetBusStopsRequestHandler;
    let callbackOnInitialize:() => void;
    let callbackOnReady:(errorMsg?:string) => void;

    beforeEach(() => {
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
        expect(handler.ltaDataMallService.loadAllBusStops).toBeCalled();
    });

    it('should subscribe to GET_BUS_STOPS_REQUEST when initializing', async() => {
        await handler.initialize();
        expect(handler.interAppService.subscribe).toBeCalledWith(GET_BUS_STOPS_REQUEST, handler.handleGetBusStops);
    });
})
