import * as React from 'react';
import { LayoutService } from '../utils/LayoutService';

export class Launcher extends React.Component {    
    constructor(props:any) {
      super(props);
      this.handleBusStopsClick = this.handleBusStopsClick.bind(this);
    }
   
    async handleBusStopsClick() {
      await LayoutService.getInstance().showChildWindow('Bus Stops','http://localhost:7777/busstops.html', 400, 600, true);
    }

    render() {
      return (
        <div className="hello">
          <div className="LauncherPanel">
            <button className="LauncherButton" onClick={this.handleBusStopsClick}>Bus Stops</button>
            <button className="LauncherButton">Bus Services</button>
            <button className="LauncherButton">Favourites</button>
          </div>
        </div>
      );
    }
    
}