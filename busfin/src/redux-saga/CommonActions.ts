import { AnyAction, ActionCreator, Dispatch } from 'redux';

export enum CommonActionEnums {
    Error = 'ERROR'
}

export interface LoadErrorAction extends AnyAction {
    type: CommonActionEnums.Error;
    message: any;
}