import { createStore, applyMiddleware, AnyAction } from 'redux';
import { RootReducer } from './RootState';
import { loadBusStopsWatcherSaga } from './BusStopsState'
import { addBusStopArrivalsWatcherSaga, loadArrivalsWatcherSaga } from './ArrivalsState'
import createSagaMiddleware from 'redux-saga'

const sagaMiddleware = createSagaMiddleware()
export const store = createStore(RootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(loadBusStopsWatcherSaga);
sagaMiddleware.run(addBusStopArrivalsWatcherSaga);
sagaMiddleware.run(loadArrivalsWatcherSaga);

export const dispatchAction = (action:AnyAction) => store.dispatch(action);