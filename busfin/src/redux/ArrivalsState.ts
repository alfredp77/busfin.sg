import { ArrivalData, BusArrival, BusStop } from '../models/DataMall';
import { AnyAction, ActionCreator, Dispatch } from 'redux';
import { ltaDataMall } from '../utils/DataMallService';
import { ThunkAction } from 'redux-thunk';
import { LoadErrorAction, LOAD_ERROR } from './ErrorAction';
import { removeFromArray } from '../utils/Collections';

export interface ArrivalsState {
    Arrivals: ArrivalData[]
    IsLoading: boolean
}

export const initialState:ArrivalsState = {
    Arrivals: [],
    IsLoading: false
}

export const LOAD_ARRIVALS = 'LOAD_ARRIVALS';
export type LOAD_ARRIVALS = typeof LOAD_ARRIVALS;

export const REMOVE_ARRIVAL = 'REMOVE_ARRIVAL';
export type REMOVE_ARRIVAL = typeof REMOVE_ARRIVAL;

export const ARRIVALS_LOADED = 'ARRIVALS_LOADED';
export type ARRIVALS_LOADED = typeof ARRIVALS_LOADED;


export interface LoadArrivalsAction extends AnyAction {
    type: LOAD_ARRIVALS;
}

export interface ArrivalsLoadedAction extends AnyAction {
    type: ARRIVALS_LOADED;
    arrivals: ArrivalData[];
}

export interface RemoveArrivalAction extends AnyAction {
    type: REMOVE_ARRIVAL;
    arrival: ArrivalData;
}


export type ArrivalsAction = LoadArrivalsAction | ArrivalsLoadedAction | RemoveArrivalAction | LoadErrorAction;

export const createLoadArrivalsAction: ActionCreator<ThunkAction<Promise<ArrivalsAction>, void, string, LoadArrivalsAction>> = (busStops:BusStop[]) => {
    return async (dispatch: Dispatch) => {
      try {
            const loadingAction:LoadArrivalsAction = {
                type: LOAD_ARRIVALS
            };
            dispatch(loadingAction);
            
            const arrivals = await Promise.all(busStops.map(async (busStop) => {
                const result = await ltaDataMall.getBusArrivals(busStop.BusStopCode);
                return result.map(item => ({
                    BusStop: busStop,
                    Arrival: item
                })) as ArrivalData[];
            }));

            let empty:ArrivalData[] = []
            const loadedAction:ArrivalsLoadedAction = {
                type: ARRIVALS_LOADED,
                arrivals: empty.concat(...arrivals)
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

export const createRemoveArrivalAction: ActionCreator<RemoveArrivalAction> = (arrival:ArrivalData) => {
    return {
        type: REMOVE_ARRIVAL,
        arrival: arrival
    };
}

export function ArrivalsReducer(state:ArrivalsState=initialState, action:AnyAction) {
    const arrivalsAction = action as ArrivalsAction;
    if (arrivalsAction) {
        switch (arrivalsAction.type) {
            case LOAD_ARRIVALS:
                return { ...state, IsLoading:true};
            case ARRIVALS_LOADED:
                return { ...state, Arrivals:arrivalsAction.arrivals, IsLoading:false }
            case REMOVE_ARRIVAL:
                return { ...state, Arrivals:removeFromArray(arrivalsAction.arrival, state.Arrivals) }
        }        
    }
    return state;
}