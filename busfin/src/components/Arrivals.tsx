import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ArrivalData, BusStop } from '../models/DataMall';
import { RootState } from '../redux-saga/RootState';
import { Dispatch } from 'redux';
import { connect, Provider } from 'react-redux';
import { InterApplicationService } from '../interapp/InterApplicationService';
import { GET_BUS_STOP_ARRIVALS_RESPONSE, GetBusStopArrivalsResponse } from '../interapp/ArrivalsHandlers';
import { store, dispatchAction } from '../redux-saga/Store';
import { ArrivalsActionEnums } from '../redux-saga/ArrivalsState';

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

export const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        removeArrival: (arrival:ArrivalData) => dispatchAction({
            type: ArrivalsActionEnums.RemoveArrival,
            busStop: arrival.BusStop}),

        loadArrivals: (busStops:BusStop[], arrivals:ArrivalData[]) => dispatch({
            type: ArrivalsActionEnums.StartLoading,
            busStops: busStops,
            arrivals: arrivals
        })
    }
}

export const ArrivalsContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
) (ArrivalsDisplay);

export class ArrivalsComponent extends React.Component {
    public interAppService = InterApplicationService.getInstance();

    constructor(props:any) {
        super(props);

        this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
    }
    
    componentDidMount() {
        // subscribe to notifications
        this.interAppService.subscribe(GET_BUS_STOP_ARRIVALS_RESPONSE, this.handleIncomingMessage);

        // schedule periodic reload of arrivals
    }

    handleIncomingMessage(arrivalsResponse:GetBusStopArrivalsResponse) {
        dispatchAction({
            type: ArrivalsActionEnums.ArrivalsLoaded,
            arrivals: arrivalsResponse.Arrivals
        });
    }

    render() {
        return <ArrivalsContainer />;        
    }
}

ReactDOM.render(
<Provider store={store}>
    <ArrivalsComponent />                
</Provider>
, document.getElementById('root'));
