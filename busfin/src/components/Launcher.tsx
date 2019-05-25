import * as React from 'react';
import { LayoutService } from '../utils/LayoutService';
import { InterAppRequestHandler } from '../interapp/InterApplicationService';
import { GetBusStopsRequestHandler } from '../interapp/BusStopsHandlers';
import { GetBusStopArrivalsRequestHandler } from '../interapp/ArrivalsHandlers';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { initializeIcons } from '@uifabric/icons';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
initializeIcons();

interface LauncherState {
  busStopsLoading: boolean
  busStopsLoaded: boolean
  busStopsLoadError: string

  arrivalsLoading: boolean,
  arrivalsLoaded: boolean,
  arrivalsLoadError: string
}

export class Launcher extends React.Component<any, LauncherState, any> {
    public requestHandlers:InterAppRequestHandler[] = [];
    public getBusStopsHandler:GetBusStopsRequestHandler;
    public arrivalsRequestHandler:GetBusStopArrivalsRequestHandler;
    private busStopsWindow:any;
    private arrivalsWindow:any;

    constructor(props:any) {
      super(props);
      this.handleBusStopsClick = this.handleBusStopsClick.bind(this);
      this.handleArrivalsClick = this.handleArrivalsClick.bind(this);
      this.showChildWindow = this.showChildWindow.bind(this);

      this.state = { 
        busStopsLoading:false,
        busStopsLoaded:false,
        busStopsLoadError: '',

        arrivalsLoading:false,
        arrivalsLoaded:false,
        arrivalsLoadError:''
      }

      this.getBusStopsHandlerInitializing = this.getBusStopsHandlerInitializing.bind(this);
      this.getBusStopsHandlerInitialized = this.getBusStopsHandlerInitialized.bind(this);
      this.getBusStopsHandler = new GetBusStopsRequestHandler(this.getBusStopsHandlerInitializing, this.getBusStopsHandlerInitialized);
      this.requestHandlers.push(this.getBusStopsHandler);

      this.getBusStopArrivalsHandlerInitializing = this.getBusStopArrivalsHandlerInitializing.bind(this);
      this.getBusStopArrivalsHandlerInitialized = this.getBusStopArrivalsHandlerInitialized.bind(this);
      this.arrivalsRequestHandler = new GetBusStopArrivalsRequestHandler(this.getBusStopArrivalsHandlerInitializing, 
                                        this.getBusStopArrivalsHandlerInitialized,
                                        this.handleArrivalsClick);
      this.requestHandlers.push(this.arrivalsRequestHandler);
    }

    componentDidMount() {
      this.requestHandlers.forEach(requestHandler => {
        requestHandler.initialize();
      });
    }

    getBusStopsHandlerInitializing() {
      this.setState({busStopsLoading:true});
    }
   
    getBusStopsHandlerInitialized(errorMsg?:string) {
      if (errorMsg) {
        this.setState({busStopsLoading:false, busStopsLoaded:false, busStopsLoadError:errorMsg});
      } else {
        this.setState({busStopsLoading:false, busStopsLoaded:true, busStopsLoadError:''});
      }
    }

    async handleBusStopsClick() {
      if (this.busStopsWindow) {
        await this.busStopsWindow.show();
      } else {
        this.busStopsWindow = await this.showChildWindow('Bus Stops', 'busstops');
        this.busStopsWindow.addListener("closed", () => {
          this.busStopsWindow = null;
        });
      }
    }


    getBusStopArrivalsHandlerInitializing() {
      this.setState({arrivalsLoading:true});
    }
   
    getBusStopArrivalsHandlerInitialized(errorMsg?:string) {
      if (errorMsg) {
        this.setState({arrivalsLoading:false, arrivalsLoaded:false, arrivalsLoadError:errorMsg});
      } else {
        this.setState({arrivalsLoading:false, arrivalsLoaded:true, arrivalsLoadError:''});
      }
    }
    async handleArrivalsClick() {
      if (this.arrivalsWindow) {
        await this.arrivalsWindow.show();
      } else {
        this.arrivalsWindow = await this.showChildWindow('Arrivals', 'arrivals');
        this.arrivalsWindow.addListener("closed", () => {
          this.arrivalsWindow = null;
        });
      }
    }

    async showChildWindow(title:string, page:string) {
      await LayoutService.getInstance().showChildWindow(title,`http://localhost:7777/${page}.html`, 400, 600, true);
    }

    render() {
      const styles = mergeStyleSets({
            root: {
              padding: "5px 30px"
            },            
      });
      
      return (
        <Stack className={styles.root} gap="15">
          <MenuButton text='Bus Stops' onClick={this.handleBusStopsClick} iconName='DOM' 
              loading={this.state.busStopsLoading}
              loadingText="Loading bus stops ..."
              disabled={!this.state.busStopsLoaded} />
          <MenuButton text='Bus Services' iconName='Bus'  />
          <MenuButton text='Arrivals' onClick={this.handleArrivalsClick} iconName='Clock' 
            loading={this.state.arrivalsLoading}
            loadingText="Loading arrivals ..."
            disabled={!this.state.arrivalsLoaded} />
          />
        </Stack>
      );
    }
    
}

export const MenuButton = (props:any) =>  {
  return (
    <DefaultButton onClick={props.onClick} disabled={props.disabled}>
        <Stack horizontal gap="10">
            {props.loading && <Spinner label={props.loadingText || "Loading ..."} labelPosition="right"/>}
            {!props.loading && <Icon iconName={props.iconName} />}
            {!props.loading && <Text>{props.text}</Text>}
        </Stack>
    </DefaultButton>
  )
}