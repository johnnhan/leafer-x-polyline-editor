import { Arrow } from '@leafer-in/arrow';
import { IArrow, IArrowData, IArrowInputData, IStrokeCap, IStrokeJoin, IArrowType, IEditorConfig, IPointData, IGroup, IGroupData } from '@leafer-ui/interface';
import { Group } from '@leafer-ui/core';

interface IPolyline extends IArrow {
}
interface IPolylineInputData extends IArrowInputData {
}
interface IPolylineData extends IArrowData {
}

declare class FreePolyline extends Arrow implements IPolyline {
    __: IPolylineData;
    strokeCap: IStrokeCap;
    strokeJoin: IStrokeJoin;
    startArrow: IArrowType;
    endArrow: IArrowType;
    editConfig: IEditorConfig;
    get __tag(): string;
    constructor(data: IPolylineInputData);
}

declare class OrthoPolyline extends Arrow implements IPolyline {
    __: IPolylineData;
    strokeCap: IStrokeCap;
    strokeJoin: IStrokeJoin;
    startArrow: IArrowType;
    endArrow: IArrowType;
    editConfig: IEditorConfig;
    get __tag(): string;
    constructor(data: IPolylineInputData);
    setStart(point: IPointData): void;
    setEnd(point: IPointData): void;
}

interface IPolylineEditor extends IGroup {
}
interface IPolylineEditorData extends IGroupData {
    color?: string;
    strokeWidth?: number;
    ellipseWidth?: number;
}
interface IPolylineInputEditor {
    color?: string;
    strokeWidth?: number;
    ellipseWidth?: number;
}

declare class PolylineEditor extends Group implements IPolylineEditor {
    __: IPolylineEditorData;
    color: string;
    strokeWidth: number;
    ellipseWidth: number;
    private line;
    private edgeEllipses;
    private midEllipses;
    private selectItem;
    constructor(config?: IPolylineInputEditor);
    get __tag(): string;
    private initEvents;
    private downHandler;
    private doubleTapHandler;
    private drawEditor;
    private clearEditor;
    private drawLine;
    private drawEdgeEllipses;
    private drawMidEllipses;
    private addEdgeEvents;
    private addMidEvents;
    redrawEditor(): void;
    private hideEllipses;
    select(line: IPolyline): void;
    cancel(): void;
}

declare function isFreeLine(points: IPointData[]): boolean;
declare function isOrthoLine(points: IPointData[]): boolean;
declare function isHorizon(point1: IPointData, point2: IPointData): boolean;
declare function isVertical(point1: IPointData, point2: IPointData): boolean;

export { FreePolyline, OrthoPolyline, PolylineEditor, isFreeLine, isHorizon, isOrthoLine, isVertical };
