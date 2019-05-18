import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Loading } from './Loading';
import { BusStop } from '../models/DataMall';
import { connect, Provider } from 'react-redux';
import { RootState } from '../redux/RootState';
import { BusStopsState, BusStopsAction, createLoadBusStopsAction } from '../redux/BusStopsState';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { store } from '../redux/Store';

interface BusStopsProps {
    BusStops: BusStop[],
    IsLoading: boolean    
}

interface BusStopsActions {
    startLoading: () => void,
    findBusStops: (busStopNumber:string) => void 
}

export class BusStopsDisplay extends React.Component<BusStopsProps & BusStopsActions, BusStopsState> {
    constructor(props:any) {
        super(props);
    }

    render() {
        return (
            <div className="BusStopsPanel">
                This is the bus stops panel
                <div className="BusStopsPanel-header">
                    <label>
                        <input type="checkbox"></input>
                        Nearest
                    </label>
                </div>
                {this.props.IsLoading ? 
                    <Loading /> : 
                    <ul>
                        {
                            this.props.BusStops.map(busStop => <li>{busStop.BusStopCode}</li>)
                        }
                    </ul>}                
            </div>
            
        );
    }

    componentDidMount() {
        this.props.startLoading();
    }
}


export const mapStateToProps = (rootState: RootState) => {
    return {
        BusStops: rootState.BusStops.BusStops,
        IsLoading: rootState.BusStops.IsLoading
    }
}
  
export const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
      startLoading: () => dispatch(createLoadBusStopsAction('')),
      findBusStops: (busStopNumber: string) => dispatch(createLoadBusStopsAction(busStopNumber)),
    };
};

export const BusStopsContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
) (BusStopsDisplay);

export const BusStopsComponent = () => {
    return (
        <Provider store={store}>
            <BusStopsContainer />
        </Provider>
    );
}

ReactDOM.render(<BusStopsComponent />, document.getElementById('root'));
