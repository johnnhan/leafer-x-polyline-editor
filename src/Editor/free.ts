import {
  addPoints,
  updatePoints,
  updateSelectItemPoints,
} from '../utils';
import {
  EDITOR_DEFAULT_ADJUST_DISTANCE,
} from '../constant';
import type { 
  IPointData,
} from '@leafer-ui/interface';
import type {
  IMemoryInfo,
} from './type';
import type {
  IPolyline,
} from '../type';

/**
 * @description: 是否显示中点
 * @param {number} index
 * @return {*}
 */
export function showMidEllipses (points: IPointData[],  index: number) {
  const prePoint = points[index] as IPointData;
  const nextPoint = points[index + 1] as IPointData;
  
  return Math.abs(prePoint.x - nextPoint.x) >= EDITOR_DEFAULT_ADJUST_DISTANCE * 2 || Math.abs(prePoint.y - nextPoint.y) >= EDITOR_DEFAULT_ADJUST_DISTANCE * 2
}

/**
 * @description: 正交折线处理编辑器端点移动
 * @param {IPointData} point 端点操控点坐标
 * @param {IMemoryInfo} memoryInfo 操控记忆
 * @return {*}
 */
export function handleEdgeMove (point: IPointData, memoryInfo: IMemoryInfo, handleLine: IPolyline, targetLine: IPolyline) {
  const { index } = memoryInfo;
  const updPoints = [{
    index,
    x: point.x,
    y: point.y,
  }];

  updatePoints(handleLine!, updPoints);
  updateSelectItemPoints(targetLine!, handleLine!.points as IPointData[]);
}

/**
 * @description: 处理中点移动
 * @param {IPointData} point 操控点的实时坐标
 * @param {IMemoryInfo} memoryInfo 操控记忆
 * @return {*}
 */
export function handleMidMove (point: IPointData, memoryInfo: IMemoryInfo, handleLine: IPolyline, targetLine: IPolyline) {
  const { length, index } = memoryInfo;
  const newPoint = {
    x: point.x,
    y: point.y,
  }
  const updPoint = {
    ...newPoint,
    index: index + 1,
  };

  if (length === handleLine!.points!.length) {
    addPoints(handleLine!, [newPoint], index + 1);
    updateSelectItemPoints(targetLine!, handleLine!.points as IPointData[]);
  } else {
    updatePoints(handleLine!, [updPoint]);
    updateSelectItemPoints(targetLine!, handleLine!.points as IPointData[]);
  }
}