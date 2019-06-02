import * as React from 'react';
import { ArrivalData } from '../models/DataMall';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

export interface ArrivalsGridProps {
    rowData: ArrivalData[]
}

export class ArrivalsGrid extends React.Component<ArrivalsGridProps, any, any>  {
    private columnDefs: Array<any>;

    constructor(props:ArrivalsGridProps) {
        super(props);

        this.columnDefs= [{
            headerName: "Bus Stop Code", 
            field: "BusStop.BusStopCode",
            width: 100
        }, 
        {
            headerName: "Service", 
            field: "Arrival.ServiceNo",
            width: 100
        },
        {
            headerName: "Next Bus (1)", 
            field: "Arrival.NextBus.EstimatedArrivalInMins",
            width: 100
        },
        {
            headerName: "Next Bus (2)", 
            field: "Arrival.NextBus2.EstimatedArrivalInMins",
            width: 100
        },
        {
            headerName: "Next Bus (3)", 
            field: "Arrival.NextBus3.EstimatedArrivalInMins",
            width: 100
        }];
    }

    render() {
        return (
            <div className='ag-theme-balham'>
                <AgGridReact 
                    columnDefs={this.columnDefs} 
                    rowData={this.props.rowData}
                />
            </div>
        )
    }
}
