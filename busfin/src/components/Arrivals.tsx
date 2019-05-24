import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ArrivalData, BusStop } from '../models/DataMall';
import { RootState } from '../redux/RootState';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { createRemoveArrivalAction, createLoadArrivalsAction, createAddBusStopAction } from '../redux/ArrivalsState';
import { connect, Provider } from 'react-redux';
import { store as realStore } from '../redux/Store';
import { InterApplicationService } from '../interapp/InterApplicationService';
import { BUS_STOP_ARRIVALS } from '../interapp/Topics';

interface ArrivalsProps {
    busStops: BusStop[]
    arrivals: ArrivalData[]
}

interface ArrivalsActions {
    removeArrival: (arrival:ArrivalData) => void
    loadArrivals: (busStops:BusStop[], arrivals:ArrivalData[]) => void
}

export class ArrivalsDisplay extends React.Component<ArrivalsProps & ArrivalsActions, any> {
    render() {
        // we'll change the display to use ag-grid, for now let's make it work first
        return (
            <div className="arrivals">
                {this.props.arrivals.length === 0 ? 
                    <p>No bus stops selected</p> : 
                    this.props.arrivals.map(arrival => <ArrivalItemDisplay arrival={arrival}/>)}
            </div>
        )
    }
}

interface ArrivalItemProps {
    arrival: ArrivalData
}

export const ArrivalItemDisplay = (props:ArrivalItemProps) => {
    console.log(JSON.stringify(props.arrival.Arrival));
    return (
        <div className="arrivalItem">                        
            [{props.arrival.BusStop.BusStopCode}] [{props.arrival.Arrival.ServiceNo}] 
            [{props.arrival.Arrival.NextBus.EstimatedArrivalInMins}]
            [{props.arrival.Arrival.NextBus2.EstimatedArrivalInMins}]
            [{props.arrival.Arrival.NextBus3.EstimatedArrivalInMins}] )}
        </div>
    )
}


export const mapStateToProps = (rootState: RootState) => {
    return {
        busStops: rootState.Arrivals.BusStops,
        arrivals: rootState.Arrivals.Arrivals
    }
}

export const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        removeArrival: (arrival:ArrivalData) => dispatch(createRemoveArrivalAction(arrival)),
        loadArrivals: (busStops:BusStop[], arrivals:ArrivalData[]) => dispatch(createLoadArrivalsAction(busStops, arrivals))
    }
}

export const ArrivalsContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
) (ArrivalsDisplay);

export class ArrivalsComponent extends React.Component {
    public store = realStore;
    public interAppService = InterApplicationService.getInstance();

    constructor(props:any) {
        super(props);

        this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
    }
    
    componentDidMount() {
        // subscribe to notifications
        this.interAppService.subscribe(BUS_STOP_ARRIVALS, this.handleIncomingMessage);

        // schedule periodic reload of arrivals
    }

    handleIncomingMessage(busStop:BusStop) {
        const dispatch = this.store.dispatch as ThunkDispatch<any, any, AnyAction>;
        dispatch(createAddBusStopAction(busStop));

        const state = this.store.getState().Arrivals;        
        dispatch(createLoadArrivalsAction(state.BusStops, state.Arrivals));
    }

    render() {
        return (
            <Provider store={this.store}>
                <ArrivalsContainer />
            </Provider>
        );
    }
}

ReactDOM.render(<ArrivalsComponent />, document.getElementById('root'));
