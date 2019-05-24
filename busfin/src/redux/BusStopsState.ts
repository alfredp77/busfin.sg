import { BusStop } from '../models/DataMall';
import { AnyAction, ActionCreator, Dispatch } from 'redux';
import { ltaDataMall } from '../utils/DataMallService';
import { ThunkAction } from 'redux-thunk';
import { LoadErrorAction, LOAD_ERROR } from './ErrorAction';
import { NoAction, noAction } from './NoAction';
import { GetBusStopsRequestSender, GetBusStopsResponse } from '../interapp/BusStopsHandlers';

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

export type BusStopsAction = LoadBusStopsAction | BusStopsLoadedAction | LoadErrorAction | NoAction;

const busStopsRequestSender:GetBusStopsRequestSender = new GetBusStopsRequestSender();

export const createLoadBusStopsAction: ActionCreator<ThunkAction<Promise<BusStopsAction>, void, string, LoadBusStopsAction>> = (busStopNumber:string) => {
  return async (dispatch: Dispatch) => {
    try {
        const loadingAction:LoadBusStopsAction = {
            type: LOAD_BUS_STOPS
        };
        dispatch(loadingAction);

        await busStopsRequestSender.getBusStops(false, busStopNumber, (response:GetBusStopsResponse) => {
            if (response.Error) {
                const errorAction:LoadErrorAction  ={
                    type: LOAD_ERROR,
                    message: response.Error
                }
                dispatch(errorAction);
            } 
            else {
                const loadedAction:BusStopsLoadedAction = {
                    type: BUS_STOPS_LOADED,
                    busStops: response.BusStops
                };
                dispatch(loadedAction);
            }
        });

        return dispatch(noAction);
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
            case LOAD_ERROR:
                return { ...state, IsLoading:false}
        }        
    }
    return state;
}

