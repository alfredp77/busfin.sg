import { AnyAction } from 'redux';

export const NO_ACTION = 'NO_ACTION';
export type NO_ACTION = typeof NO_ACTION;

export interface NoAction extends AnyAction {
    type: NO_ACTION;
}

export const noAction:NoAction = {
    type: NO_ACTION
}