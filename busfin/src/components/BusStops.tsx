import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BusStop } from '../models/DataMall';
import { connect, Provider } from 'react-redux';
import { RootState } from '../redux-saga/RootState';
import { store, dispatchAction } from '../redux-saga/Store';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { Overlay } from 'office-ui-fabric-react/lib/Overlay';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { BusStopsGrid } from './BusStopsGrid'; 
import { mergeStyleSets, DefaultPalette } from 'office-ui-fabric-react/lib/Styling';
import { BusStopsActionEnums } from '../redux-saga/BusStopsState';
import { ArrivalsActionEnums } from '../redux-saga/ArrivalsState';

interface BusStopsProps {
    busStops: BusStop[]
    isLoading: boolean
    loadingText: string    
}

interface BusStopsActions {
    startLoading: () => void
    findBusStops: (busStopNumber:string) => void 
    getArrivals: (busStop:BusStop) => void
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
        this.handleGetArrivals = this.handleGetArrivals.bind(this);
    }

    fetchBusStops() {
        this.props.findBusStops(this.state.search);
    }

    handleSearchChange(ev:any, newValue?:string) {
        this.setState({ search: newValue || '' });
    }

    handleNearestChange(e:any, checked?:boolean) {
        this.setState({ nearest: checked || false });
    }

    handleGetArrivals(busStop:BusStop) {
        this.props.getArrivals(busStop);
    }

    render() {
        const styles = mergeStyleSets({
            root: {
              background: DefaultPalette.themeTertiary,
              padding: "20px 10px"
            },
      
            item: {
              color: DefaultPalette.white,
              background: DefaultPalette.themePrimary,
              padding: 5
            },

            spinner: {
                width: 180,
                height: 60,
                background: DefaultPalette.whiteTranslucent40,
              }
        });

        return (
            <Stack>
                <Stack className={styles.root}>
                    <Checkbox label="Nearest" checked={this.state.nearest} onChange={this.handleNearestChange} />
                    <TextField label="Bus stop code"  value={this.state.search} onChange={this.handleSearchChange} />
                    <Button text="Find" onClick={this.fetchBusStops} disabled={this.props.isLoading} />
                </Stack>
                <BusStopsGrid rowData={this.props.busStops} getArrivals={this.handleGetArrivals} />                
                {this.props.isLoading && 
                    <Overlay isDarkThemed={true}>
                        <Stack verticalAlign="center" verticalFill={true} horizontalAlign="center">
                            <Spinner className={styles.spinner} label={this.props.loadingText} labelPosition="top" />
                        </Stack>
                    </Overlay>
                }
            </Stack>               
        );
    }
}


export const mapStateToProps = (rootState: RootState) => {
    return {
        busStops: rootState.BusStops.BusStops,
        isLoading: rootState.BusStops.IsLoading || rootState.Arrivals.IsLoading,
        loadingText: rootState.BusStops.IsLoading ? 'Finding bus stops ...' : rootState.Arrivals.IsLoading ? 'Loading arrivals ...' : ''
    }
}
  
export const mapDispatchToProps = () => {
    return {
      startLoading: () => dispatchAction({
            type: BusStopsActionEnums.StartLoading,
            busStop: ''
        }),
      findBusStops: (busStopNumber: string) => dispatchAction({
            type: BusStopsActionEnums.StartLoading,
            busStop: busStopNumber
        }),
      getArrivals: (busStop: BusStop) => dispatchAction({
            type: ArrivalsActionEnums.AddBusStop,
            busStop: busStop
        })
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
