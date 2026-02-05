import {
  IGroup,
  IGroupData,
  IPointData,
} from '@leafer-ui/interface';

export interface IMemoryInfo {
  index?: number,
  length?: number,
  side?: IPointData | null,
  spaced?: IPointData | null,
  pre?: IPointData | null,
  next?: IPointData | null,
}

export interface IPolylineEditor extends IGroup {

}

export interface IPolylineEditorData extends IGroupData {
  color?: string;
  strokeWidth?: number;
  ellipseWidth?: number; 
}

export interface IPolylineInputEditor {
  color?: string;
  strokeWidth?: number;
  ellipseWidth?: number;
}