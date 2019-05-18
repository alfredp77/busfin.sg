import { AnyAction } from 'redux';

export const LOAD_ERROR = 'LOAD_ERROR';
export type LOAD_ERROR = typeof LOAD_ERROR;

export interface LoadErrorAction extends AnyAction {
    type: LOAD_ERROR;
    message: any;
}