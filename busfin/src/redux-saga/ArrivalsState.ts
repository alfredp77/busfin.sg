import { takeLatest, call, put, select } from "redux-saga/effects";
import { BusStop, ArrivalData } from '../models/DataMall';
import { AnyAction } from 'redux';
import { LoadErrorAction, CommonActionEnums } from './CommonActions';
import { GetBusStopArrivalsRequestSender, ArrivalParams, GetBusStopArrivalsResponse } from '../interapp/ArrivalsHandlers';
import { removeFromArray, toDictionary } from '../utils/Collections';
import { RootState } from "./RootState";

export enum ArrivalsActionEnums {
    AddBusStop = 'ADD_BUS_STOP',
    StartLoading = 'START_LOADING_ARRIVALS',
    RemoveArrival = 'REMOVE_ARRIVAL',
    ArrivalsLoaded = 'ARRIVALS_LOADED'
}

export interface AddBusStopArrivalsAction extends AnyAction {
    type: ArrivalsActionEnums.AddBusStop;
    busStop: BusStop;
}

export interface LoadArrivalsAction extends AnyAction {
    type: ArrivalsActionEnums.StartLoading;
    busStops: BusStop[];
    arrivals: ArrivalData[];
}

export interface ArrivalsLoadedAction extends AnyAction {
    type: ArrivalsActionEnums.ArrivalsLoaded;
    arrivals: ArrivalData[];
}

export interface RemoveArrivalAction extends AnyAction {
    type: ArrivalsActionEnums.RemoveArrival;
    arrival: ArrivalData;
}

export type ArrivalsAction = AddBusStopArrivalsAction | LoadArrivalsAction | ArrivalsLoadedAction | RemoveArrivalAction | LoadErrorAction;

const arrivalsRequestSender = new GetBusStopArrivalsRequestSender();

export function* addBusStopArrivalsWatcherSaga() {
    yield takeLatest(ArrivalsActionEnums.AddBusStop, loadArrivalsSaga);
}

export function* loadArrivalsWatcherSaga() {
    yield takeLatest(ArrivalsActionEnums.StartLoading, loadArrivalsSaga);
}

function* loadArrivalsSaga() {
    try {
        const state:ArrivalsState = yield select((state:RootState) => state.Arrivals);

        const params:ArrivalParams = {
            BusStops: state.BusStops,
            Arrivals: state.Arrivals
        }

        const response:GetBusStopArrivalsResponse = yield call(arrivalsRequestSender.getArrivals, params);
        if (response.Error) {
            yield put({
                type: CommonActionEnums.Error,
                message: response.Error
            });
        } 
        else {
            yield put({
                type: ArrivalsActionEnums.ArrivalsLoaded,
                arrivals: response.Arrivals
            });
        }

  } catch (e) {
        yield put({
            type: CommonActionEnums.Error,
            message: e
        });
  }
}

export interface ArrivalsState {
    BusStops: BusStop[]
    Arrivals: ArrivalData[]
    IsLoading: boolean
    Error: ''
}

export const initialState:ArrivalsState = {
    BusStops: [],
    Arrivals: [],
    IsLoading: false,
    Error: ''
}

export function ArrivalsReducer(state:ArrivalsState=initialState, action:AnyAction) {
    const arrivalsAction = action as ArrivalsAction;
    if (arrivalsAction) {
        switch (arrivalsAction.type) {
            case ArrivalsActionEnums.AddBusStop:
                const busStopCodes = new Set(state.BusStops.map(busStop => busStop.BusStopCode));
                const updatedBusStops = busStopCodes.has(arrivalsAction.busStop.BusStopCode) ? 
                                            state.BusStops : [arrivalsAction.busStop].concat(state.BusStops);
                return { ...state, IsLoading:true, BusStops:updatedBusStops };
            case ArrivalsActionEnums.StartLoading:
                return { ...state, IsLoading:true};
            case ArrivalsActionEnums.ArrivalsLoaded:
                return { ...state, Arrivals:arrivalsAction.arrivals, IsLoading:false };
            case ArrivalsActionEnums.RemoveArrival:
                const remainingArrivals = removeFromArray(arrivalsAction.arrival, state.Arrivals);
                const busStopsMap = toDictionary(remainingArrivals.map(arrival => arrival.BusStop), busStop => busStop.BusStopCode);
                const busStops = Array.from(busStopsMap.values());
                return { ...state, 
                    BusStops: busStops,
                    Arrivals:remainingArrivals};
        }        
    }
    return state;
}
