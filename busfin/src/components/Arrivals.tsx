import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ArrivalData } from '../models/DataMall';
import { RootState } from '../redux/RootState';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

interface ArrivalsProps {
    arrivals: ArrivalData[]
}

interface ArrivalsActions {
    removeArrival: (arrival:ArrivalData) => void
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


// export const mapStateToProps = (rootState: RootState) => {
//     return {
//         Search: rootState.BusStops.Search,
//         BusStops: rootState.BusStops.BusStops,
//         IsLoading: rootState.BusStops.IsLoading
//     }
// }
  
// export const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
//     return {
//       startLoading: () => dispatch(createLoadBusStopsAction('')),
//       findBusStops: (busStopNumber: string) => dispatch(createLoadBusStopsAction(busStopNumber)),
//     };
// };

// export const BusStopsContainer = connect(
//     mapStateToProps,
//     mapDispatchToProps,
// ) (BusStopsDisplay);

// export const BusStopsComponent = () => {
//     return (
//         <Provider store={store}>
//             <BusStopsContainer />
//         </Provider>
//     );
// }

// ReactDOM.render(<BusStopsComponent />, document.getElementById('root'));
