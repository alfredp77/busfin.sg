import * as redux from 'redux';
import { BusStopsState, BusStopsReducer } from './BusStopsState';

export interface RootState {
    BusStops: BusStopsState;
}

export const RootReducer = redux.combineReducers<RootState>({
    BusStops: BusStopsReducer
});