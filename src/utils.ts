import type {
  IUpdatePointData,
} from './type';
import type {
  ILine,
  IPointData,
} from '@leafer-ui/interface';
import {
  EDITOR_DEFAULT_ADJUST_DISTANCE,
} from './constant';

/**
 * @description: 根据端点计算中点
 * @param {IPointData} points
 * @return {*}
 */
export function getMidPoints (points: IPointData[]) {
  return points.reduce((acc, cur, index, arr) => {
    if (index > 0) {
      acc.push({
        x: (arr[index - 1].x + cur.x) / 2,
        y: (arr[index - 1].y + cur.y) / 2,
      });
    }

    return acc;
  }, []); 
}

/**
* @description: 获取格式化后的点
* @param {IPointData} points
* @return {*}
*/
export function getFormatPoints (points: IPointData[] | number[]) {
 if (!points.length) return points as IPointData[];
 if (isPointData(points)) return points as IPointData[];

 return points.reduce((acc, cur, index, arr) => {
   if (index % 2) {
     acc.push({
       x: arr[index - 1] as number,
       y: cur as number,
     });
   }
   
   return acc;
 }, [] as IPointData[]);
}

/**
 * @description: 判断是否为 IPointData 类型
 * @param {IPointData} points
 * @return {*}
 */
export function isPointData (points: IPointData[] | number[]) {
  return points.length && typeof points[0] === 'object';
}

/**
 * @description: 是否水平线
 * @param {IPointData} point1
 * @param {IPointData} point2
 * @return {*}
 */
export function isHorizon (point1: IPointData, point2: IPointData) {
  return point1.y === point2.y && point1.x !== point2.x;
}

/**
 * @description: 是否垂直线
 * @param {IPointData} point1
 * @param {IPointData} point2
 * @return {*}
 */
export function isVertical (point1: IPointData, point2: IPointData) {
  return point1.x === point2.x && point1.y !== point2.y;
}

/**
 * @description: 新增点
 * @param {ILine} line
 * @param {number} x
 * @param {number} y
 * @param {number} index
 * @return {*}
 */
export function addPoints (line: ILine, points: IPointData[], index: number) {
  const newPoints = [...line.points];

  newPoints.splice(index, 0, ...points);
  line.setAttr('points', newPoints);
}

/**
 * @description: 移除点
 * @param {ILine} line
 * @param {number} index
 * @param {number} count
 * @return {*}
 */
export function removePoints (line: ILine, index: number, count: number) {
  const newPoints = [...line.points];

  newPoints.splice(index, count);
  line.setAttr('points', newPoints);
}

/**
 * @description: 更新点
 * @param {ILine} line
 * @param {number} x
 * @param {number} y
 * @param {number} index
 * @return {*}
 */
export function updatePoints (line: ILine, points: IUpdatePointData[]) {
  const newPoints = [...line.points];

  points.forEach(point => {
    const { index, x, y } = point;
    newPoints[index] = { x, y };
  });

  line.setAttr('points', newPoints);
}


/**
 * @description: 是否显示中点
 * @param {number} index
 * @return {*}
 */
export function showMidEllipses (points: IPointData[],  index: number) {
  const prePoint = points[index] as IPointData;
  const nextPoint = points[index + 1] as IPointData;
  const isHori = isHorizon(prePoint, nextPoint);
  
  return isHori
    ? Math.abs(prePoint.x - nextPoint.x) >= EDITOR_DEFAULT_ADJUST_DISTANCE * 2
    : Math.abs(prePoint.y - nextPoint.y) >= EDITOR_DEFAULT_ADJUST_DISTANCE * 2;
}