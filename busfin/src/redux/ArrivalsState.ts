import { ArrivalData, BusArrival, BusStop } from '../models/DataMall';
import { AnyAction, ActionCreator, Dispatch } from 'redux';
import { ltaDataMall } from '../utils/DataMallService';
import { ThunkAction } from 'redux-thunk';
import { LoadErrorAction, LOAD_ERROR } from './ErrorAction';
import { removeFromArray, toDictionary } from '../utils/Collections';


export interface ArrivalsState {
    BusStops: BusStop[]
    Arrivals: ArrivalData[]
    IsLoading: boolean
}

export const initialState:ArrivalsState = {
    BusStops: [],
    Arrivals: [],
    IsLoading: false
}

export const ADD_BUS_STOP = 'ADD_BUS_STOP';
export type ADD_BUS_STOP = typeof ADD_BUS_STOP;

export const LOAD_ARRIVALS = 'LOAD_ARRIVALS';
export type LOAD_ARRIVALS = typeof LOAD_ARRIVALS;

export const REMOVE_ARRIVAL = 'REMOVE_ARRIVAL';
export type REMOVE_ARRIVAL = typeof REMOVE_ARRIVAL;

export const ARRIVALS_LOADED = 'ARRIVALS_LOADED';
export type ARRIVALS_LOADED = typeof ARRIVALS_LOADED;

export interface AddBusStopAction extends AnyAction {
    type: ADD_BUS_STOP;
    busStop: BusStop;
}

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

export type ArrivalsAction = AddBusStopAction | LoadArrivalsAction | ArrivalsLoadedAction | RemoveArrivalAction | LoadErrorAction;

export const createLoadArrivalsAction: ActionCreator<ThunkAction<Promise<ArrivalsAction>, void, string, LoadArrivalsAction>>
= (busStops:BusStop[], arrivals:ArrivalData[]) => {
    return async (dispatch: Dispatch) => {
      try {
            const loadingAction:LoadArrivalsAction = {
                type: LOAD_ARRIVALS
            };
            dispatch(loadingAction);
            
            const existingBusStops = toDictionary(arrivals.map(arrival => arrival.BusStop), busStop => busStop.BusStopCode);
            const newBusStops = toDictionary(busStops.filter(busStop => !existingBusStops.has(busStop.BusStopCode)), busStop => busStop.BusStopCode);
            const arrivalsMap = toDictionary(arrivals, arrival => arrival.Id);
            const response = await Promise.all(busStops.map(async (busStop) => {
                const result = await ltaDataMall.getBusArrivals(busStop.BusStopCode);
                return result.map(item => ({
                    Id: `${busStop.BusStopCode}-${item.ServiceNo}`,
                    BusStop: busStop,
                    Arrival: item
                })) as ArrivalData[];
            }));

            let empty:ArrivalData[] = []
            const newArrivals = empty.concat(...response).filter(arrival => arrivalsMap.has(arrival.Id) || newBusStops.has(arrival.BusStop.BusStopCode));
            console.log(`New arrivals ${newArrivals.length}: ${JSON.stringify(newArrivals)}`);

            const loadedAction:ArrivalsLoadedAction = {
                type: ARRIVALS_LOADED,
                arrivals: newArrivals
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

export const createAddBusStopAction: ActionCreator<AddBusStopAction> = (busStop:BusStop) => {
    return {
        type: ADD_BUS_STOP,
        busStop: busStop
    }
}

export function ArrivalsReducer(state:ArrivalsState=initialState, action:AnyAction) {
    const arrivalsAction = action as ArrivalsAction;
    if (arrivalsAction) {
        switch (arrivalsAction.type) {
            case ADD_BUS_STOP:
                const busStopCodes = new Set(state.BusStops.map(busStop => busStop.BusStopCode));
                const updatedBusStops = busStopCodes.has(arrivalsAction.busStop.BusStopCode) ? 
                                            state.BusStops : [arrivalsAction.busStop].concat(state.BusStops);
                return { ...state, BusStops:updatedBusStops };
            case LOAD_ARRIVALS:
                return { ...state, IsLoading:true};
            case ARRIVALS_LOADED:
                return { ...state, Arrivals:arrivalsAction.arrivals, IsLoading:false };
            case REMOVE_ARRIVAL:
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