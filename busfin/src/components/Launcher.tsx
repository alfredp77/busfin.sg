import * as React from 'react';
import { LayoutService } from '../utils/LayoutService';
import { InterApplicationService } from '../utils/InterApplicationService';
import { GET_BUS_STOPS_REQUEST, GET_BUS_STOPS_RESPONSE } from './Topics';
import { GetBusStopsRequest, GetBusStopsResponse, InterAppRequestHandler } from '../models/DataMall';
import { LTADataMall, ltaDataMall } from '../utils/DataMallService';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

export class Launcher extends React.Component {
    public requestHandlers:InterAppRequestHandler[] = []
    public getBusStopsHandler:GetBusStopsRequestHandler;

    constructor(props:any) {
      super(props);
      this.handleBusStopsClick = this.handleBusStopsClick.bind(this);
      this.handleArrivalsClick = this.handleArrivalsClick.bind(this);
      this.showChildWindow = this.showChildWindow.bind(this);

      this.state = { 
        busStopsLoading:false,
        busStopsLoaded:false,
        busStopsLoadError: ''
      }
      this.getBusStopsHandlerInitializing = this.getBusStopsHandlerInitializing.bind(this);
      this.getBusStopsHandlerInitialized = this.getBusStopsHandlerInitialized.bind(this);
      this.getBusStopsHandler = new GetBusStopsRequestHandler(this.getBusStopsHandlerInitializing, this.getBusStopsHandlerInitialized);
      this.requestHandlers.push(this.getBusStopsHandler);
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
      await this.showChildWindow('Bus Stops', 'busstops');
    }

    async handleArrivalsClick() {
      await this.showChildWindow('Arrivals','arrivals');
    }

    async showChildWindow(title:string, page:string) {
      await LayoutService.getInstance().showChildWindow(title,`http://localhost:7777/${page}.html`, 400, 600, true);
    }

    render() {
      return (
        <Stack>
          <IconButton iconProps={{ iconName: 'BusSolid'}} onClick={this.handleBusStopsClick}/>
        </Stack>
        // <div className="hello">
        //   <div className="LauncherPanel">
        //     <button className="LauncherButton" onClick={this.handleBusStopsClick}>Bus Stops</button>
        //     <button className="LauncherButton">Bus Services</button>
        //     <button className="LauncherButton" onClick={this.handleArrivalsClick}>Arrivals</button>
        //   </div>
        // </div>
      );
    }
    
}

export class GetBusStopsRequestHandler implements InterAppRequestHandler {
    public interAppService = InterApplicationService.getInstance();
    public ltaDataMallService = ltaDataMall;

    constructor(
      private callbackOnInitialize:() => void,
      private callbackOnReady:(errorMsg?:string) => void) {
      this.handleGetBusStops = this.handleGetBusStops.bind(this);
    }

    async handleGetBusStops(request:GetBusStopsRequest) {
      let response:GetBusStopsResponse = {
        RequestId: request.Id,
        Error: '',
        BusStops: []
      }

      try {
        response.BusStops = await this.ltaDataMallService.searchBusStop(request.BusStopCode);
        this.interAppService.publish(GET_BUS_STOPS_RESPONSE, response);
      } catch (e) {
        response.Error = `Failed to fetch bus stops. Error: ${e}`;
        this.interAppService.publish(GET_BUS_STOPS_RESPONSE, response)
      }
    }

    async initialize() {
      this.callbackOnInitialize();

      this.interAppService.subscribe(GET_BUS_STOPS_REQUEST, this.handleGetBusStops)

      try {
        await this.ltaDataMallService.loadAllBusStops();
        this.callbackOnReady();
      } catch (e) {
        this.callbackOnReady(`Failed to fetch bus stops. Error: ${e}`);
      }
    }
}