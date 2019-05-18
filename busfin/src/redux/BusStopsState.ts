import { BusStop } from '../models/DataMall';
import { AnyAction, ActionCreator, Dispatch } from 'redux';
import { ltaDataMall } from '../utils/DataMallService';
import { ThunkAction } from 'redux-thunk';
import { LoadErrorAction, LOAD_ERROR } from './ErrorAction';

export interface BusStopsState {
    BusStops: BusStop[]
    IsLoading: boolean
}

export const initialState:BusStopsState = {
    BusStops: [],
    IsLoading: false
}

export const LOAD_BUS_STOPS = 'LOAD_BUS_STOPS';
export type LOAD_BUS_STOPS = typeof LOAD_BUS_STOPS;

export const BUS_STOPS_LOADED = 'BUS_STOPS_LOADED';
export type BUS_STOPS_LOADED = typeof BUS_STOPS_LOADED;

export interface LoadBusStopsAction extends AnyAction {
    type: LOAD_BUS_STOPS;
}

export interface BusStopsLoadedAction extends AnyAction {
    type: BUS_STOPS_LOADED;
    busStops: BusStop[];
}

export type BusStopsAction = LoadBusStopsAction | BusStopsLoadedAction | LoadErrorAction;

export const createLoadBusStopsAction: ActionCreator<ThunkAction<Promise<BusStopsAction>, void, string, LoadBusStopsAction>> = (busStopNumber:string) => {
  return async (dispatch: Dispatch) => {
    try {
        const loadingAction:LoadBusStopsAction = {
            type: LOAD_BUS_STOPS
        };
        dispatch(loadingAction);

        const busStops = await ltaDataMall.searchBusStop(busStopNumber);
        const loadedAction:BusStopsLoadedAction = {
            type: BUS_STOPS_LOADED,
            busStops: busStops
        };        
        return dispatch(loadedAction);
    } catch (e) {
        const errorAction:LoadErrorAction = {
            type: LOAD_ERROR,
            message: e
        }
        return dispatch(errorAction);
    }
  };
};

export function BusStopsReducer(state:BusStopsState=initialState, action:AnyAction) {
    const busStopsAction = action as BusStopsAction;
    if (busStopsAction) {
        switch (busStopsAction.type) {
            case LOAD_BUS_STOPS:
                return { ...state, IsLoading:true};
            case BUS_STOPS_LOADED:
                return { ...state, BusStops:busStopsAction.busStops, IsLoading:false }
        }        
    }
    return state;
}

