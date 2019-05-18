import * as React from 'react';
import { BusStop } from '../models/DataMall';

interface BusStopComponentProps {
    busStop: BusStop
}

export const BusStopComponent = (props:BusStopComponentProps) => {
    return (
        <div className="BusStop">
            <a href="#">{props.busStop.BusStopCode}</a>
        </div>
    );
}