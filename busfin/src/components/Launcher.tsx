import * as React from 'react';
import { LayoutService } from '../utils/LayoutService';

export class Launcher extends React.Component {    
    constructor(props:any) {
      super(props);
      this.handleBusStopsClick = this.handleBusStopsClick.bind(this);
      this.handleArrivalsClick = this.handleArrivalsClick.bind(this);
      this.showChildWindow = this.showChildWindow.bind(this);
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
        <div className="hello">
          <div className="LauncherPanel">
            <button className="LauncherButton" onClick={this.handleBusStopsClick}>Bus Stops</button>
            <button className="LauncherButton">Bus Services</button>
            <button className="LauncherButton" onClick={this.handleArrivalsClick}>Arrivals</button>
          </div>
        </div>
      );
    }
    
}