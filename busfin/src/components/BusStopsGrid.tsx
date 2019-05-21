import * as React from 'react';
import { BusStop } from '../models/DataMall';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

export interface BusStopsGridProps {
    rowData: BusStop[]
    getArrivals: (busStop:BusStop) => void
}

export class BusStopsGrid extends React.Component<BusStopsGridProps, any, any>  {
    private columnDefs: Array<any>;
    private cellRenderers: any;
    private iconButtonContext: IconButtonContext;

    constructor(props:BusStopsGridProps) {
        super(props);

        this.columnDefs= [{
            headerName: "Bus Stop Code", 
            field: "BusStopCode",
            width: 100
        }, 
        {
            headerName: "Description", 
            field: "Description",
            width: 180
        },
        {
            headerName: "Arrival", 
            field: "BusStopCode",
            cellRenderer: "iconButtonRenderer"
        }];

        this.cellRenderers = {
            iconButtonRenderer: IconButtonRenderer
        }

        this.arrivalClickHandler = this.arrivalClickHandler.bind(this);
        this.iconButtonContext = {
            iconName: 'Clock',
            clickHandler: this.arrivalClickHandler
        }
    }

    arrivalClickHandler(value:any) {
        const busStop = value as BusStop;
        if (busStop) {
            this.props.getArrivals(busStop);
        }
    }

    render() {
        return (
            <div className='ag-theme-balham'>
            <AgGridReact 
                columnDefs={this.columnDefs} 
                rowData={this.props.rowData}
                context={this.iconButtonContext}
                frameworkComponents={this.cellRenderers}
            />
            </div>
        )
    }
}

export interface IconButtonContext {
    iconName: string
    clickHandler: (value:any) => void
}

export class IconButtonRenderer extends React.Component<any, any, any> {
    private buttonContext:IconButtonContext;

    constructor(props:any) {
        super(props);

        this.buttonContext = props as IconButtonContext;
        this.handleOnClick = this.handleOnClick.bind(this);
    }

    handleOnClick() {
        this.buttonContext.clickHandler(this.props.data);
    }

    render() {
        return (
            <span>
                <IconButton iconProps={{ iconName: this.buttonContext.iconName}} onClick={this.handleOnClick} />
            </span>
        )
    }
}