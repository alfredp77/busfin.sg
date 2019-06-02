import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ArrivalData, BusStop } from '../models/DataMall';
import { RootState } from '../redux-saga/RootState';
import { Dispatch } from 'redux';
import { connect, Provider } from 'react-redux';
import { interAppService } from '../interapp/InterApplicationService';
import { GET_BUS_STOP_ARRIVALS_RESPONSE, GetBusStopArrivalsResponse, ArrivalParams } from '../interapp/ArrivalsHandlers';
import { store, dispatchAction } from '../redux-saga/Store';
import { ArrivalsActionEnums } from '../redux-saga/ArrivalsState';
import { ArrivalsGrid } from './ArrivalsGrid';

interface ArrivalsActions {
    removeArrival: (arrival:ArrivalData) => void
    loadArrivals: (arrivalParams:ArrivalParams[]) => void
}

export class ArrivalsDisplay extends React.Component<ArrivalParams & ArrivalsActions, any> {
    render() {
        // we'll change the display to use ag-grid, for now let's make it work first
        return (
            <div className="arrivals">
                <ArrivalsGrid rowData={this.props.arrivals} />                
            </div>
        )
    }
}

export const mapStateToProps = (rootState: RootState) => {
    const arrivalParams:ArrivalParams =  {
        busStops: rootState.Arrivals.BusStops,
        arrivals: rootState.Arrivals.Arrivals
    }
    return arrivalParams;
}

export const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        removeArrival: (arrival:ArrivalData) => dispatchAction({
            type: ArrivalsActionEnums.RemoveArrival,
            busStop: arrival.BusStop}),

        loadArrivals: (arrivalParams:ArrivalParams[]) => dispatch({
            type: ArrivalsActionEnums.StartLoading,
            arrivalParams: arrivalParams
        })
    }
}

export const ArrivalsContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
) (ArrivalsDisplay);

export class ArrivalsComponent extends React.Component {
    constructor(props:any) {
        super(props);

        this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
    }
    
    componentDidMount() {
        // subscribe to notifications
        interAppService.subscribe(GET_BUS_STOP_ARRIVALS_RESPONSE, this.handleIncomingMessage);

        // schedule periodic reload of arrivals
    }

    handleIncomingMessage(arrivalsResponse:GetBusStopArrivalsResponse) {
        dispatchAction({
            type: ArrivalsActionEnums.ArrivalsLoaded,
            arrivals: arrivalsResponse.arrivals
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
