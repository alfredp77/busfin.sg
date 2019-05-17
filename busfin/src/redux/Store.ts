import { createStore, applyMiddleware } from 'redux';
import { RootReducer } from './RootState';
import thunk from 'redux-thunk';

let store = createStore(RootReducer, applyMiddleware(thunk));

export { store };