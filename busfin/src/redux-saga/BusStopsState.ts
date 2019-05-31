import { takeLatest, call, put } from "redux-saga/effects";

import { BusStop } from '../models/DataMall';
import { AnyAction } from 'redux';
import { GetBusStopsRequestSender, GetBusStopsResponse } from '../interapp/BusStopsHandlers';
import { CommonActionEnums, LoadErrorAction } from './CommonActions';

export enum BusStopsActionEnums {
    StartLoading = 'START_LOADING',
    Loaded = 'LOADED'
}

export interface LoadBusStopsAction extends AnyAction {
    type: BusStopsActionEnums.StartLoading;
    busStop: string;
}

export interface BusStopsLoadedAction extends AnyAction {
    type: BusStopsActionEnums.Loaded;
    busStops: BusStop[];
}

export type BusStopsAction = LoadBusStopsAction | BusStopsLoadedAction | LoadErrorAction;

const busStopsRequestSender = new GetBusStopsRequestSender();

export function* loadBusStopsWatcherSaga() {
    yield takeLatest(BusStopsActionEnums.StartLoading, loadBusStopsSaga);
}

function* loadBusStopsSaga(action:BusStopsAction) {
    try {
        const response:GetBusStopsResponse = yield call(busStopsRequestSender.getBusStops, false, action.busStop);
        if (response.Error) {
            yield put({
                type: CommonActionEnums.Error,
                message: response.Error
            })
        } 
        else {
            yield put({
                type: BusStopsActionEnums.Loaded,
                busStops: response.BusStops
            });
        }
        
    } catch (e) {
        yield put({
            type: CommonActionEnums.Error,
            message: e
        })
    }
}

export interface BusStopsState {
    BusStops: BusStop[]
    IsLoading: boolean
    Error: any
}

export const initialState:BusStopsState = {
    BusStops: [],
    IsLoading: false,
    Error: ''
}

export function BusStopsReducer(state:BusStopsState=initialState, action:AnyAction) {
    const busStopsAction = action as BusStopsAction;
    if (busStopsAction) {
        switch (busStopsAction.type) {
            case BusStopsActionEnums.StartLoading:
                return { ...state, IsLoading:true};
            case BusStopsActionEnums.Loaded:
                return { ...state, BusStops:busStopsAction.busStops, IsLoading:false }
            case CommonActionEnums.Error:
                return { ...state, IsLoading:false, Error:busStopsAction.message}
        }        
    }
    return state;
}
