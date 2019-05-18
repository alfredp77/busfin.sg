import * as redux from 'redux';
import { BusStopsState, BusStopsReducer } from './BusStopsState';
import { ArrivalsState, ArrivalsReducer } from './ArrivalsState';

export interface RootState {
    BusStops: BusStopsState
    Arrivals: ArrivalsState
}

export const RootReducer = redux.combineReducers<RootState>({
    BusStops: BusStopsReducer,
    Arrivals: ArrivalsReducer
});