import { Arrow } from '@leafer-in/arrow';
import { FreePolylineData } from './data';
import { 
  registerUI,
  boundsType,
  dataProcessor,
} from '@leafer-ui/core';
import type {
  IStrokeCap,
  IStrokeJoin,
  IArrowType,
} from '@leafer-ui/interface';
import {
  POLYLINE_DEFAULT_STROKE_JOIN,
  POLYLINE_DEFAULT_STROKE_CAP,
  POLYLINE_DEFAULT_START_ARROW,
  POLYLINE_DEFAULT_END_ARROW,
} from '../constant';

import type {
  IFreePolyline,
  IFreePolylineData,
  IFreePolylineInputData,
} from './type';

@registerUI()
export class FreePolyline extends Arrow implements IFreePolyline {
  @boundsType(POLYLINE_DEFAULT_STROKE_CAP)
  declare public strokeCap: IStrokeCap;

  @boundsType(POLYLINE_DEFAULT_STROKE_JOIN)
  declare public strokeJoin: IStrokeJoin;

  @boundsType(POLYLINE_DEFAULT_START_ARROW)
  declare public startArrow: IArrowType;

  @boundsType(POLYLINE_DEFAULT_END_ARROW)
  declare public endArrow: IArrowType;

  @dataProcessor(FreePolylineData)
  declare public __: IFreePolylineData;

  /**
   * @description: 自定义元素名称
   * @return {*}
   */
  public get __tag () { 
    return 'FreePolyline';
  }

  /**
   * @description: 构造函数
   * @param {IFreePolylineInputData} data
   * @return {*}
   */
  constructor (data: IFreePolylineInputData) {
    super(data);
  }
}
