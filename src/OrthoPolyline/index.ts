import { Arrow } from '@leafer-in/arrow';
import { OrthoPolylineData } from './data';
import {
  isHorizon,
  isVertical,
  getFormatPoints,
} from '../utils';
import { 
  registerUI,
  boundsType,
  dataProcessor,
} from '@leafer-ui/core';
import {
  POLYLINE_DEFAULT_STROKE_JOIN,
  POLYLINE_DEFAULT_STROKE_CAP,
  POLYLINE_DEFAULT_START_ARROW,
  POLYLINE_DEFAULT_END_ARROW,
} from '../constant';

import type {
  IPointData,
  IStrokeCap,
  IStrokeJoin,
  IArrowType,
} from '@leafer-ui/interface';
import type {
  IOrthoPolyline,
  IOrthoPolylineData,
  IOrthoPolylineInputData,
} from './type';

@registerUI()
export class OrthoPolyline extends Arrow implements IOrthoPolyline {
  @boundsType(POLYLINE_DEFAULT_STROKE_CAP)
  declare public strokeCap: IStrokeCap;

  @boundsType(POLYLINE_DEFAULT_STROKE_JOIN)
  declare public strokeJoin: IStrokeJoin;

  @boundsType(POLYLINE_DEFAULT_START_ARROW)
  declare public startArrow: IArrowType;

  @boundsType(POLYLINE_DEFAULT_END_ARROW)
  declare public endArrow: IArrowType;

  @dataProcessor(OrthoPolylineData)
  declare public __: IOrthoPolylineData;

  /**
   * @description: 自定义元素名称
   * @return {*}
   */
  public get __tag () { 
    return 'OrthoPolyline';
  }

  /**
   * @description: 构造函数
   * @param {IOrthoPolylineInputData} data
   * @return {*}
   */
  constructor (data: IOrthoPolylineInputData) {
    super(data);
    
    if (!this.isOrthoLine(getFormatPoints(this.points))) {
      throw new Error('Params points can\'t paint an orthogonal polylines!');
    }
  }

  /**
   * @description: 检查是否正交折线
   * @param {IPointData} points
   * @return {*}
   */
  private isOrthoLine (points : IPointData[]) {
    if (points.length < 2) return false;
    
    return points.every((point, index, arr) => {
      if (index === 0) {
        return true;
      } else {
        if (isHorizon(arr[index - 1], point)) {
          return arr[index - 2]
            ? isVertical(arr[index - 2], arr[index - 1])
            : true;
        } else if (isVertical(arr[index - 1], point)) {
          return arr[index - 2]
           ? isHorizon(arr[index - 2], arr[index - 1])
           : true;
        } else {
          return false;
        }
      }
    });
  }
}
