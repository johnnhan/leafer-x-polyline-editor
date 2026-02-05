import { Arrow } from '@leafer-in/arrow';
import { PolylineData } from './data';
import { isFreeLine } from '../../utils';
import { 
  registerUI,
  boundsType,
  createAttr,
  dataProcessor,
} from '@leafer-ui/core';
import {
  POLYLINE_DEFAULT_STROKE_JOIN,
  POLYLINE_DEFAULT_STROKE_CAP,
  POLYLINE_DEFAULT_START_ARROW,
  POLYLINE_DEFAULT_END_ARROW,
  POLYLINE_DEFAULT_EDIT_CONFIG,
} from '../../constant';
import type {
  IPointData,
  IStrokeCap,
  IStrokeJoin,
  IArrowType,
  IEditorConfig,
} from '@leafer-ui/interface';
import type {
  IPolyline,
  IPolylineData,
  IPolylineInputData,
} from '../../type';

@registerUI()
export class FreePolyline extends Arrow implements IPolyline {
  @dataProcessor(PolylineData)
  declare public __: IPolylineData;

  @boundsType(POLYLINE_DEFAULT_STROKE_CAP)
  declare public strokeCap: IStrokeCap;

  @boundsType(POLYLINE_DEFAULT_STROKE_JOIN)
  declare public strokeJoin: IStrokeJoin;

  @boundsType(POLYLINE_DEFAULT_START_ARROW)
  declare public startArrow: IArrowType;

  @boundsType(POLYLINE_DEFAULT_END_ARROW)
  declare public endArrow: IArrowType;

  @createAttr(POLYLINE_DEFAULT_EDIT_CONFIG)
  declare public editConfig: IEditorConfig;

  /**
   * @description: 自定义元素名称
   * @return {*}
   */
  public get __tag () { 
    return 'FreePolyline';
  }

  /**
   * @description: 构造函数
   * @param {IPolylineInputData} data
   * @return {*}
   */
  constructor (data: IPolylineInputData) {
    super(data);

    if (!isFreeLine(this.points as IPointData[])) {
      const jsonData = JSON.stringify(data);
      const errorMsg = `Params points can't paint an orthogonal polylines!\n${jsonData}`;
      throw new Error(errorMsg);
    }
  }
}
