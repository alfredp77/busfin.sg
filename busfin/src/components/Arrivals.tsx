import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ArrivalData, BusStop } from '../models/DataMall';
import { RootState } from '../redux/RootState';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { createRemoveArrivalAction, createLoadArrivalsAction } from '../redux/ArrivalsState';
import { connect, Provider } from 'react-redux';
import { store } from '../redux/Store';


interface ArrivalsProps {
    arrivals: ArrivalData[]
}

interface ArrivalsActions {
    removeArrival: (arrival:ArrivalData) => void
    loadArrivals: (busStops:BusStop[]) => void
}

export class ArrivalsDisplay extends React.Component<ArrivalsProps & ArrivalsActions, any> {
    render() {
        // we'll change the display to use ag-grid, for now let's make it work first
        return (
            <div className="arrivals">
                {this.props.arrivals.map(arrival => <ArrivalItemDisplay arrival={arrival}/>)}
            </div>
        )
    }
}

interface ArrivalItemProps {
    arrival: ArrivalData
}

export const ArrivalItemDisplay = (props:ArrivalItemProps) => {
    return (
        <div className="arrivalItem">                        
            [{props.arrival.BusStop.BusStopCode}] [{props.arrival.Arrival.ServiceNo}] 
            {props.arrival.Arrival.NextBus.map(info => `[${info.EstimatedArrivalInMins}]` )}
        </div>
    )
}


export const mapStateToProps = (rootState: RootState) => {
    return {
        arrivals: rootState.Arrivals.Arrivals
    }
}

export const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        removeArrival: (arrival:ArrivalData) => dispatch(createRemoveArrivalAction(arrival)),
        loadArrivals: (busStops:BusStop[]) => dispatch(createLoadArrivalsAction(busStops))
    }
}

export const ArrivalsContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
) (ArrivalsDisplay);

export const ArrivalsComponent = () => {
    return (
        <Provider store={store}>
            <ArrivalsContainer />
        </Provider>
    );
}

ReactDOM.render(<ArrivalsComponent />, document.getElementById('root'));
