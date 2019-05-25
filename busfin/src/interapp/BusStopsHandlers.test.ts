import * as React from 'react';
import * as enzyme from 'enzyme';
import { GetBusStopsRequestHandler } from './BusStopsHandlers';
import { LTADataMall } from '../utils/DataMallService';
import { InterApplicationService } from './InterApplicationService';

jest.mock('../utils/DataMallService');
jest.mock('./InterApplicationService');

describe('GetBusStopRequestHandlerTests', () => {
    let handler:GetBusStopsRequestHandler;
    let callbackOnInitialize:() => void;
    let callbackOnReady:(errorMsg?:string) => void;
    let dataMallService:LTADataMall;
    let interAppService:InterApplicationService;

    beforeEach(() => {
        callbackOnInitialize = jest.fn();
        callbackOnReady = jest.fn();
        handler = new GetBusStopsRequestHandler(callbackOnInitialize, callbackOnReady);
    });


})
