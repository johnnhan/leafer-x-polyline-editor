import {
  IGroup,
  IPointData,
} from '@leafer-ui/interface';

export interface IMemoryInfo {
  index?: number,
  side?: IPointData | null,
  spaced?: IPointData | null,
  pre?: IPointData | null,
  next?: IPointData | null,
}

export interface IOrthoPolylineEditor extends IGroup {

}

export interface IOrthoPolylineInputEditor {
  color?: string;
  strokeWidth?: number;
  ellipseWidth?: number; 
}