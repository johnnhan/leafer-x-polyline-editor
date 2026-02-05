import { PolylineData } from './data';
import { 
  isHorizon,
  isOrthoLine,
} from '../../utils';
import { 
  Arrow,
  arrowType,
} from '@leafer-in/arrow';
import { 
  registerUI,
  strokeType,
  dataType,
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
export class OrthoPolyline extends Arrow implements IPolyline {
  @dataProcessor(PolylineData)
  declare public __: IPolylineData;

  @strokeType(POLYLINE_DEFAULT_STROKE_CAP)
  declare public strokeCap: IStrokeCap;

  @strokeType(POLYLINE_DEFAULT_STROKE_JOIN)
  declare public strokeJoin: IStrokeJoin;

  @arrowType(POLYLINE_DEFAULT_START_ARROW)
  declare public startArrow: IArrowType;

  @arrowType(POLYLINE_DEFAULT_END_ARROW)
  declare public endArrow: IArrowType;

  @dataType(POLYLINE_DEFAULT_EDIT_CONFIG)
  declare public editConfig: IEditorConfig;

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
  constructor (data: IPolylineInputData) {
    super(data);

    if (!isOrthoLine(this.points as IPointData[])) {
      const jsonData = JSON.stringify(data);
      const errorMsg = `Params points can't paint an orthogonal polylines!\n${jsonData}`;
      throw new Error(errorMsg);
    }
  }

    /**
   * @description: 设置管道起始点
   * @param {IPointData} point
   * @return {*}
   */
  public setStart (point: IPointData) {
    const { points } = this;
    const newPoints = [...points];
    const curPoint = newPoints[0]! as IPointData;
    const sidePoint = newPoints[1]! as IPointData;
    const h = isHorizon(curPoint, sidePoint);

    if (newPoints.length === 2) {
      const midValue = h
        ? (curPoint.x + sidePoint.x) / 2
        : (curPoint.y + sidePoint.y) / 2;

      newPoints.splice(1, 0, {
        x: h ? midValue : curPoint.x,
        y: h ? curPoint.y : midValue,
      }, {
        x: h ? midValue : sidePoint.x,
        y: h ? sidePoint.y : midValue,
      });
    } else {
      const spacePoint = newPoints[2] as IPointData;

      // 保证正交折线没有相同的点
      curPoint.x = point.x === spacePoint.x ? point.x + 1e-6 : point.x;
      curPoint.y = point.y === spacePoint.y ? point.y + 1e-6 : point.y;

      newPoints[1] = {
        x: h ? sidePoint.x : curPoint.x,
        y: h ? curPoint.y : sidePoint.y,
      };
    }

    this.setAttr('points', newPoints);
  }

  /**
   * @description: 设置管道结束点
   * @param {IPointData} point
   * @return {*}
   */
  public setEnd (point: IPointData) {
    const { points } = this;
    const newPoints = [...points];
    const curPoint = newPoints.at(-1)! as IPointData;
    const sidePoint = newPoints.at(-2)! as IPointData;
    const h = isHorizon(curPoint, sidePoint);

    if (newPoints.length === 2) {
      const midValue = h
        ? (curPoint.x + sidePoint.x) / 2
        : (curPoint.y + sidePoint.y) / 2;

      newPoints.splice(-1, 0, {
        x: h ? midValue : sidePoint.x,
        y: h ? sidePoint.y : midValue,
      }, {
        x: h ? midValue : curPoint.x,
        y: h ? curPoint.y : midValue,
      });
    } else {
      const spacePoint = newPoints.at(-3)! as IPointData;
      
      // 保证正交折线没有相同的点
      curPoint.x = point.x === spacePoint.x ? point.x + 1e-6 : point.x;
      curPoint.y = point.y === spacePoint.y ? point.y + 1e-6 : point.y;

      newPoints[newPoints.length - 2] = {
        x: h ? sidePoint.x : curPoint.x,
        y: h ? curPoint.y : sidePoint.y,
      };
    }

    this.setAttr('points', newPoints);
  }
}
