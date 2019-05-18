import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Loading } from './Loading';
import { BusStop } from '../models/DataMall';
import { BusStopComponent } from './BusStop';
import { connect, Provider } from 'react-redux';
import { RootState } from '../redux/RootState';
import { BusStopsState, BusStopsAction, createLoadBusStopsAction } from '../redux/BusStopsState';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { store } from '../redux/Store';

interface BusStopsProps {
    BusStops: BusStop[]
    IsLoading: boolean    
}

interface BusStopsActions {
    startLoading: () => void
    findBusStops: (busStopNumber:string) => void 
}

interface BusStopsDisplayState {
    search: string,
    nearest: boolean
}
export class BusStopsDisplay extends React.Component<BusStopsProps & BusStopsActions, BusStopsDisplayState> {
    constructor(props:any) {
        super(props);
        this.state = { search: '', nearest: false};
        this.fetchBusStops = this.fetchBusStops.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleNearestChange = this.handleNearestChange.bind(this);
    }

    fetchBusStops() {
        this.props.findBusStops(this.state.search);
    }

    handleSearchChange(e:React.ChangeEvent<HTMLInputElement>) {
        this.setState({ search: e.target.value });
    }

    handleNearestChange(e:React.ChangeEvent<HTMLInputElement>) {
        this.setState({ nearest: e.target.checked });
    }

    render() {
        return (
            <div className="BusStopsPanel">
                This is the bus stops panel
                <div className="BusStopsPanel-header">
                    <p>
                        <label>
                            <input type="checkbox" checked={this.state.nearest} onChange={this.handleNearestChange}></input>
                            Nearest
                        </label>
                    </p>
                    <p>
                        <label>
                            Bus stop code:
                            <input value={this.state.search} onChange={this.handleSearchChange}></input>
                        </label>
                    </p>
                    <p>
                        <button onClick={this.fetchBusStops}>Load</button>
                    </p>
                </div>
                {this.props.IsLoading ? 
                    <Loading /> : 
                    <ul>
                        {
                            this.props.BusStops.map(busStop => <BusStopComponent key={busStop.BusStopCode} busStop={busStop} />)
                        }
                    </ul>}                
            </div>
            
        );
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
