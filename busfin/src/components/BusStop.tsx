import * as React from 'react';
import { BusStop } from '../models/DataMall';

interface BusStopComponentProps {
    busStop: BusStop,
    getArrivals: (arg:BusStop) => void
}

export class BusStopComponent extends React.Component<BusStopComponentProps, any, any> {
    constructor(props:BusStopComponentProps) {
        super(props);
        this.handleGetArrivals = this.handleGetArrivals.bind(this);
    }

    handleGetArrivals() {
        this.props.getArrivals(this.props.busStop);
    }

    render() {
        return (
            <div className="BusStop">
                {this.props.busStop.BusStopCode}
                <button onClick={this.handleGetArrivals}>Arrivals</button>
            </div>
        );
    }
}