import type {
  ILine,
  IPointData,
} from '@leafer-ui/interface';
import type {
  IUpdatePointData,
} from './type';
  
/**
 * @description: 检查 points 是否能形成自由折线
 * @param {IPointData} points
 * @return {*}
 */
export function isFreeLine (points: IPointData[]) {
  return points.length >= 2;
}

/**
 * @description: 检查 points 是否能形成正交折线
 * @param {IPointData} points
 * @return {*}
 */
export function isOrthoLine (points: IPointData[]) {
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
 * @description: 检查两个点是否形成水平线
 * @param {IPointData} point1
 * @param {IPointData} point2
 * @return {*}
 */
export function isHorizon (point1: IPointData, point2: IPointData) {
  return point1.y === point2.y && point1.x !== point2.x;
}

/**
 * @description: 检查两个点是否形成垂直线
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
 * @description: 更新选中元素的点
 * @param {ILine} line
 * @param {IPointData} points
 * @return {*}
 */
export function updateSelectItemPoints (line: ILine, points: IPointData[]) {
  const newPoints = points.map((point: IPointData) => line.getInnerPoint(point));
  line.setAttr('points', newPoints);
}