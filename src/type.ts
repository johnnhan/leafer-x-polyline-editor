import type {
  IArrow,
  IPointData,
  IArrowData,
  IArrowInputData,
} from '@leafer-ui/interface';

export interface IPolyline extends IArrow {

}

export interface IPolylineInputData extends IArrowInputData {

}

export interface IPolylineData extends IArrowData {

}

export interface IUpdatePointData extends IPointData {
  index: number,
}
