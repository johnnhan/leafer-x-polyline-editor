import { Arrow } from '@leafer-in/arrow';
import { IArrow, IArrowInputData, IArrowData, IStrokeCap, IStrokeJoin, IArrowType, IGroup } from '@leafer-ui/interface';
import { Group } from '@leafer-ui/core';

interface IFreePolyline extends IArrow {
}
interface IFreePolylineInputData extends IArrowInputData {
}
interface IFreePolylineData extends IArrowData {
}

declare class FreePolyline extends Arrow implements IFreePolyline {
    strokeCap: IStrokeCap;
    strokeJoin: IStrokeJoin;
    startArrow: IArrowType;
    endArrow: IArrowType;
    __: IFreePolylineData;
    get __tag(): string;
    constructor(data: IFreePolylineInputData);
}

interface IOrthoPolyline extends IArrow {
}
interface IOrthoPolylineInputData extends IArrowInputData {
}
interface IOrthoPolylineData extends IArrowData {
}

declare class OrthoPolyline extends Arrow implements IOrthoPolyline {
    strokeCap: IStrokeCap;
    strokeJoin: IStrokeJoin;
    startArrow: IArrowType;
    endArrow: IArrowType;
    __: IOrthoPolylineData;
    get __tag(): string;
    constructor(data: IOrthoPolylineInputData);
    private isOrthoLine;
}

interface IFreePolylineEditor extends IGroup {
}
interface IFreePolylineInputEditor {
    color?: string;
    strokeWidth?: number;
    ellipseWidth?: number;
}

declare class FreePolylineEditor extends Group implements IFreePolylineEditor {
    zIndex: number;
    color: string;
    strokeWidth: number;
    ellipseWidth: number;
    private line;
    private rect;
    private edgeEllipses;
    private midEllipses;
    private selectItem;
    constructor(config?: IFreePolylineInputEditor);
    private initEvents;
    private downHandler;
    private zoomHandler;
    private drawEditor;
    private clearEditor;
    private drawRect;
    private drawLine;
    private drawEdgeEllipses;
    private drawMidEllipses;
    private addRectEvents;
    private addEdgeEvents;
    private addMidEvents;
    private redrawEllipses;
    private removeEllipses;
}

interface IOrthoPolylineEditor extends IGroup {
}
interface IOrthoPolylineInputEditor {
    color?: string;
    strokeWidth?: number;
    ellipseWidth?: number;
}

declare class OrthoPolylineEditor extends Group implements IOrthoPolylineEditor {
    zIndex: number;
    color: string;
    strokeWidth: number;
    ellipseWidth: number;
    private line;
    private rect;
    private edgeEllipses;
    private midEllipses;
    private selectItem;
    constructor(config?: IOrthoPolylineInputEditor);
    private initEvents;
    private downHandler;
    private zoomHandler;
    private drawEditor;
    private clearEditor;
    private drawRect;
    private drawLine;
    private drawEdgeEllipses;
    private drawMidEllipses;
    private addRectEvents;
    private addEdgeEvents;
    private addMidEvents;
    private handleEdgeMove;
    private handleTwoPoints;
    private handleMultiPoints;
    private handleMidMove;
    private handleEdgeLine;
    private handleOtherLine;
    private redrawEllipses;
    private removeEllipses;
}

export { FreePolyline, FreePolylineEditor, OrthoPolyline, OrthoPolylineEditor };
