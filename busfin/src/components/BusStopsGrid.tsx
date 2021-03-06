import * as React from 'react';
import { BusStop } from '../models/DataMall';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { initializeIcons } from '@uifabric/icons';
initializeIcons();

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
            headerName: "", 
            field: "BusStopCode",
            cellRenderer: "iconButtonRenderer"
        }];

        this.cellRenderers = {
            iconButtonRenderer: IconButtonRenderer
        }

        this.arrivalClickHandler = this.arrivalClickHandler.bind(this);
        this.iconButtonContext = {
            iconName: 'Clock',
            tooltipText: 'Show Arrivals',
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
    tooltipText: string
    clickHandler: (value:any) => void
}

export class IconButtonRenderer extends React.Component<any, any, any> {
    private buttonContext:IconButtonContext;

    constructor(props:any) {
        super(props);

        this.buttonContext = props.context as IconButtonContext;
        this.handleOnClick = this.handleOnClick.bind(this);
    }

    handleOnClick() {
        this.buttonContext.clickHandler(this.props.data);
    }

    render() {
        console.log(`iconName:${this.buttonContext.iconName}`);
        return <IconButton iconProps={{ iconName: this.buttonContext.iconName}} title={this.buttonContext.tooltipText} onClick={this.handleOnClick} />
    }
}