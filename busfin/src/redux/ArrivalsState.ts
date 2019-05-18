import { ArrivalData } from '../models/DataMall';
import { AnyAction, ActionCreator, Dispatch } from 'redux';
import { ltaDataMall } from '../utils/DataMallService';
import { ThunkAction } from 'redux-thunk';
import { LoadErrorAction, LOAD_ERROR } from './ErrorAction';

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

export const ARRIVALS_LOADED = 'ARRIVALS_LOADED';
export type ARRIVALS_LOADED = typeof ARRIVALS_LOADED;

export interface LoadArrivalsAction extends AnyAction {
    type: LOAD_ARRIVALS;
}

export interface ArrivalsLoadedAction extends AnyAction {
    type: ARRIVALS_LOADED;
    arrivals: ArrivalData[];
}

export type ArrivalsAction = LoadArrivalsAction | ArrivalsLoadedAction | LoadErrorAction;

export const createLoadArrivalsAction: ActionCreator<ThunkAction<Promise<ArrivalsAction>, void, string, LoadArrivalsAction>> = (busStopNumbers:string[]) => {
    return async (dispatch: Dispatch) => {
      try {
          const loadingAction:LoadArrivalsAction = {
              type: LOAD_ARRIVALS
          };
          dispatch(loadingAction);
  
        // //   const busStops = await ltaDataMall.getBusArrivals(busStopNumber);
        // //   const loadedAction:BusStopsLoadedAction = {
        // //       type: BUS_STOPS_LOADED,
        // //       busStops: busStops
        // //   };        
        //   return dispatch(loadedAction);
      } catch (e) {
          const errorAction:LoadErrorAction = {
              type: LOAD_ERROR,
              message: e
          }
          return dispatch(errorAction);
      }
    };
  };
  
