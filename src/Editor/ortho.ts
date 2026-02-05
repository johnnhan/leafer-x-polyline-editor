import {
  addPoints,
  isHorizon,
  removePoints,
  updatePoints,
  updateSelectItemPoints,
} from '../utils';
import {
  EDITOR_DEFAULT_ADJUST_DISTANCE,
} from '../constant';
import type {
  IUpdatePointData,
} from '../type';
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
  const isHori = isHorizon(prePoint, nextPoint);
  
  return isHori
    ? Math.abs(prePoint.x - nextPoint.x) >= EDITOR_DEFAULT_ADJUST_DISTANCE * 2
    : Math.abs(prePoint.y - nextPoint.y) >= EDITOR_DEFAULT_ADJUST_DISTANCE * 2;
}

/**
 * @description: 正交折线处理编辑器端点移动
 * @param {IPointData} point 端点操控点坐标
 * @param {IMemoryInfo} memoryInfo 操控记忆
 * @return {*}
 */
export function handleEdgeMove (point: IPointData, memoryInfo: IMemoryInfo, handleLine: IPolyline, targetLine: IPolyline) {
  const { points } = handleLine!;
  const length = points!.length;

  if (length === 2) { // 两个点时的处理逻辑
    handleTwoPoints(point, points as IPointData[], memoryInfo, handleLine, targetLine);
  } else { // 多个点时的处理逻辑
    handleMultiPoints(point, points as IPointData[], memoryInfo, handleLine, targetLine);
  }
}

/**
 * @description: 处理中点移动
 * @param {IPointData} point 操控点的实时坐标
 * @param {IMemoryInfo} memoryInfo 操控记忆
 * @return {*}
 */
export function handleMidMove (point: IPointData, memoryInfo: IMemoryInfo, handleLine: IPolyline, targetLine: IPolyline) {
  const { points } = handleLine!;
  const length = points!.length;
  const { index } = memoryInfo;

  if (index === 0 || index === length - 2) {
    handleEdgeLine(point, points as IPointData[], memoryInfo, handleLine, targetLine);
  } else {
    handleOtherLine(point, points as IPointData[], memoryInfo, handleLine, targetLine);
  }
}

/**
 * @description: 处理两个点的情况，主要为了压缩代码，所以可读性较差
 * @param {IPointData} realPoint 操控点的实时坐标
 * @param {IPointData} points 操控线的点坐标数组
 * @param {IMemoryInfo} memoryInfo 操控记忆
 * @return {*}
 */
function handleTwoPoints (realPoint: IPointData, points: IPointData[], memoryInfo: IMemoryInfo, handleLine: IPolyline, targetLine: IPolyline) {
  const { index, side, spaced, length } = memoryInfo;
  const isFirst = index === 0; // 是否起点
  const isHori = isHorizon(points[0], points[1]); // 是否水平线
  const sidePoint = isFirst ? points[1] : points[0]; // 另一个点
  const xy = isHori ? 'x' : 'y'; // 用到的 x 或 y
  const yx = isHori ? 'y' : 'x'; // 用到的 y 或 x
  const uIndex = isFirst ? 0 : points.length - 1;
  const distance = Math.abs(realPoint[yx] - sidePoint[yx]); // 第一个点和第二个点的 yx 方向距离
  const oppoDistance = Math.abs(realPoint[xy] - sidePoint[xy]); // 第一个点和第二个点的 xy 方向距离
  const newPoints = [];
  const updPoints = [];

  if (oppoDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) return;
  
  if (distance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
    updPoints.push({
      index: uIndex,
      x: isHori ? realPoint.x : sidePoint.x,
      y: isHori ? sidePoint.y : realPoint.y,
    });
  } else {
    updPoints.push({
      index: uIndex,
      x: realPoint.x,
      y: realPoint.y,
    });

    if (side) {
      memoryInfo.side = null;
      newPoints.push({
        x: isHori ? realPoint.x : side.x,
        y: isHori ? side.y : realPoint.y,
      });
    } else {
      const value = spaced
        ? spaced[xy]
        : (points[0][xy] + points[1][xy]) / 2;

      if (Math.abs(value - realPoint[xy]) < EDITOR_DEFAULT_ADJUST_DISTANCE) {
        return;
      }

      const pointA = {
        x: isHori ? value : realPoint.x,
        y: isHori ? realPoint.y : value,
      };
      const pointB = {
        x: isHori ? value : sidePoint.x,
        y: isHori ? sidePoint.y : value,
      };

      memoryInfo.spaced = null;
      isFirst
        ? (length === 3 ? newPoints.push(pointA) : newPoints.push(pointA, pointB)) 
        : (length === 3 ? newPoints.push(pointA) : newPoints.push(pointB, pointA));
    }
  }

  if (updPoints.length) {
    updatePoints(handleLine!, updPoints);
    updateSelectItemPoints(targetLine!, handleLine!.points as IPointData[]);
  }

  if (newPoints.length) {
    addPoints(handleLine!, newPoints, 1);
    updateSelectItemPoints(targetLine!, handleLine!.points as IPointData[]);
  }
}

/**
 * @description: 处理多个点的情况，主要为了压缩代码，所以可读性较差
 * @param {IPointData} realPoint 操控点的实时坐标
 * @param {IPointData} points 操控线的点坐标数组
 * @param {IMemoryInfo} memoryInfo 操控记忆
 * @return {*}
 */  
function handleMultiPoints (realPoint: IPointData, points: IPointData[], memoryInfo: IMemoryInfo, handleLine: IPolyline, targetLine: IPolyline) {
  const { index, side, spaced } = memoryInfo;
  const isFirst = index === 0; // 是否起点
  const length = points.length; // 点的个数
  const curPoint = isFirst ? points[0] : points.at(-1); // 当前点
  const sidePoint = isFirst ? points[1] : points.at(-2); // 相邻的点
  const spacedPoint = isFirst ? points[2] : points.at(-3); // 间隔的点
  const spacedTwoPoint = isFirst? points[3] : points.at(-4); // 间隔两个的点
  const isHori = isHorizon(curPoint!, sidePoint!);
  const uIndex = isFirst ? 0 : length - 1;
  const hIndex = isFirst ? 1 : length - 2;
  const xy = isHori ? 'x' : 'y'; // 用到的 x 或 y
  const yx = isHori ? 'y' : 'x'; // 用到的 y 或 x
  const distance = Math.abs(realPoint[yx] - sidePoint![yx]); // 第一个点和第二个点的 yx 方向距离
  const oppoDistance = Math.abs(realPoint[xy] - sidePoint![xy]); // 第一个点和第二个点的 xy 方向距离
  const spacedDistance = Math.abs(realPoint[yx] - spacedPoint![yx]); // 第一个点和第三个点的 yx 方向距离
  const oppoSpacedDistance = Math.abs(realPoint[xy] - spacedPoint![xy]); // 第一个点和第三个点的 xy 方向距离
  const newPoints = [];
  const updPoints = [];
  let delInfo = null; 

  if (spacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE && oppoSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) { // 间隔的点太近不处理防止异常
    return;
  }

  if (spacedTwoPoint) { // 间隔两个的点太近不处理防止异常
    const spacedTwoDistance = Math.abs(realPoint[yx] - spacedTwoPoint[yx]); // 第一个点和第四个点的 yx 方向距离
    const oppoSpacedTwoDistance = Math.abs(realPoint[xy] - spacedTwoPoint[xy]); // 第一个点和第四个点的 xy 方向距离

    if (spacedTwoDistance < EDITOR_DEFAULT_ADJUST_DISTANCE  && oppoSpacedTwoDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
      return;
    }
  }

  if (side || spaced) { // 如果有记忆则恢复记忆
    if (oppoDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) return;

    if (distance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
      updPoints.push({
        index: uIndex,
        x: isHori ? realPoint.x : sidePoint!.x,
        y: isHori ? sidePoint!.y : realPoint.y,
      });
    } else {
      updPoints.push({
        index: uIndex,
        x: realPoint.x,
        y: realPoint.y,
      });

      if (side) {
        memoryInfo.side = null;
        newPoints.push({
          x: isHori ? realPoint.x : side.x,
          y: isHori ? side.y : realPoint.y,
        });
      } else {
        if (Math.abs(spaced![xy] - realPoint[xy]) < EDITOR_DEFAULT_ADJUST_DISTANCE) {
          return;
        }

        const pointA = {
          x: isHori ? spaced!.x : realPoint.x,
          y: isHori ? realPoint.y : spaced!.y,
        };
        const pointB = {
          x: isHori ? spaced!.x : sidePoint!.x,
          y: isHori ? sidePoint!.y : spaced!.y,
        };
        
        memoryInfo.spaced = null;
        isFirst ? newPoints.push(pointA, pointB) : newPoints.push(pointB, pointA);
      }
    }
  } else {
    if (oppoDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
      updPoints.push({
        index: uIndex,
        x: isHori ? sidePoint!.x : realPoint.x,
        y: isHori ? realPoint.y : sidePoint!.y,
      });

      memoryInfo.side = {
        x: isHori ? sidePoint!.x : realPoint.x,
        y: isHori ? realPoint.y : sidePoint!.y,
      };

      delInfo = {
        index: hIndex,
        count: 1,
      };
    } else if (spacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
      const endIndex = (length - 3) || 1;
      const removeIndex = isFirst ? 1 : endIndex;
      const removeCount = length === 3 ? 1 : 2;

      updPoints.push({
        index: uIndex,
        x: isHori ? realPoint.x : spacedPoint!.x,
        y: isHori ? spacedPoint!.y : realPoint.y,
      });

      memoryInfo.length = length;
      memoryInfo.spaced = {
        x: isHori ? sidePoint!.x : spacedPoint!.x,
        y: isHori ? spacedPoint!.y : sidePoint!.y,  
      };

      delInfo = {
        index: removeIndex,
        count: removeCount,
      };
    } else {
      updPoints.push({
        index: uIndex,
        x: realPoint.x,
        y: realPoint.y,
      }, {
        index: hIndex,
        x: isHori ? sidePoint!.x : realPoint.x,
        y: isHori ? realPoint.y : sidePoint!.y,
      });
    }
  }

  if (updPoints.length) {
    updatePoints(handleLine!, updPoints);
    updateSelectItemPoints(targetLine!, handleLine!.points as IPointData[]);
  }

  if (newPoints.length) {
    const addIndex = isFirst ? 1 : length - 1;
    
    addPoints(handleLine!, newPoints, addIndex);
    updateSelectItemPoints(targetLine!, handleLine!.points as IPointData[]);
  }

  if (delInfo) {
    const { index, count } = delInfo;
    
    removePoints(targetLine!, index, count);
    removePoints(handleLine!, index, count);
  }
}

/**
 * @description: 处理边线
 * @param {IPointData} realPoint 操控点的实时坐标
 * @param {IPointData} points 操控线的点坐标数组
 * @param {IMemoryInfo} memoryInfo 操控记忆
 * @return {*}
 */
function handleEdgeLine (realPoint: IPointData, points: IPointData[], memoryInfo: IMemoryInfo, handleLine: IPolyline, targetLine: IPolyline) {
  const { pre, next, index } = memoryInfo;
  const tempMemory = {...memoryInfo};
  const length = points.length;
  const prePoint = length === 2 || index === 0 ? points[0] : points[length - 2]; // 前一个点
  const nextPoint = length === 2 || index === 0 ? points[1] : points[length - 1]; // 后一个点
  const isHori = isHorizon(prePoint, nextPoint); // 是否水平线
  const yx = isHori ? 'y' : 'x'; // 用到的 y 或 x
  const preDistance = Math.abs(realPoint[yx] - prePoint[yx]);
  const nextDistance = Math.abs(realPoint[yx] - nextPoint[yx]);
  const newPoints = [];
  const updPoints = [];

  if (preDistance < EDITOR_DEFAULT_ADJUST_DISTANCE || nextDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) return;

  if (pre) {
    tempMemory.index! += 2;
    tempMemory.pre = null;
    newPoints.push({
      x: isHori ? pre.x : prePoint.x,
      y: isHori ? prePoint.y : pre.y,
    }, { 
      x: isHori ? pre.x : realPoint.x, 
      y: isHori ? realPoint.y : pre.y,
    });
  } else {
    if (index === 0) {
      tempMemory.index! += 1;
      newPoints.push({
        x: isHori ? prePoint.x : realPoint.x,
        y: isHori ? realPoint.y : prePoint.y,
      });
    } else {
      updPoints.push({
        index: length - 2,
        x: isHori ? prePoint.x : realPoint.x,
        y: isHori ? realPoint.y : prePoint.y,
      });
    }
  }

  if (next) {
    tempMemory.next = null;
    newPoints.push({ 
      x: isHori ? next.x : realPoint.x, 
      y: isHori ? realPoint.y : next.y,
    }, { 
      x: isHori ? next.x : nextPoint.x, 
      y: isHori ? nextPoint.y : next.y,
    });
  } else {
    if (index === length - 2) {
      newPoints.push({
        x: isHori ? nextPoint.x : realPoint.x,
        y: isHori ? realPoint.y : nextPoint.y,
      });
    } else {
      updPoints.push({
        index: 1,
        x: isHori ? nextPoint.x : realPoint.x,
        y: isHori ? realPoint.y : nextPoint.y,
      });
    }
  }

  memoryInfo.pre = tempMemory.pre;
  memoryInfo.next = tempMemory.next;
  memoryInfo.index = tempMemory.index;

  if (updPoints.length) {
    updatePoints(handleLine!, updPoints);
    updateSelectItemPoints(targetLine!, handleLine!.points as IPointData[]);
  }

  if (newPoints.length) {
    const aIndex = index === 0 ? 1 : length - 1;

    addPoints(handleLine!, newPoints, aIndex);
    updateSelectItemPoints(targetLine!, handleLine!.points as IPointData[]);
  }
}

/**
 * @description: 处理中间线
 * @param {IPointData} realPoint 操控点的实时坐标
 * @param {IPointData} points 操控线的点坐标数组
 * @param {IMemoryInfo} memoryInfo 操控记忆
 * @return {*}
 */
function handleOtherLine (realPoint: IPointData, points: IPointData[], memoryInfo: IMemoryInfo, handleLine: IPolyline, targetLine: IPolyline) {
  const { pre, next, index } = memoryInfo;
  const tempMemory = {...memoryInfo};
  const length = points.length;
  const preSpaced = points[index! - 1];
  const prePoint = points[index!];
  const nextPoint = points[index! + 1];
  const nextSpaced = points[index! + 2];
  const isHori = isHorizon(prePoint, nextPoint); // 是否水平线
  const xy = isHori ? 'x' : 'y'; // 用到的 x 或 y
  const yx = isHori ? 'y' : 'x'; // 用到的 y 或 x
  const preSpacedDistance = Math.abs(realPoint[yx] - preSpaced[yx]); // 实时点和间隔点 yx 方向距离
  const nextSpacedDistance = Math.abs(realPoint[yx] - nextSpaced[yx]); // 实时点和间隔点 yx 方向距离
  const newPoints = [];
  const updPoints = [];
  const delInfo = {
    preCount: 0,
    nextCount: 0,
  };

  if (pre) { // 如果有前记忆点
    const preDistance = Math.abs(realPoint[yx] - prePoint[yx]); // 实时点和相邻点 yx 方向距离
    if (nextSpacedDistance >= EDITOR_DEFAULT_ADJUST_DISTANCE && preDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) return;
    const tempPoint = nextSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE ? nextSpaced : realPoint;

    tempMemory.index! += 2;
    tempMemory.pre = null;
    newPoints.push({
      x: isHori ? pre.x : prePoint.x,
      y: isHori ? prePoint.y : pre.y,
    }, {
      x: isHori ? pre.x : tempPoint.x,
      y: isHori ? tempPoint.y : pre.y,
    });
  } else {
    if (preSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE && preSpacedDistance <= nextSpacedDistance) {
      const count = index === 1 ? 1 : 2;
      delInfo.preCount = count;
      tempMemory.index! -= count;

      if (index !== 1) {
        tempMemory.pre = {
          x: isHori ? prePoint.x : realPoint.x,
          y: isHori ? realPoint.y : prePoint.y,
        };
      }
    } else if (nextSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
      if (points[index! + 3]) {
        const jumpDistance = Math.abs(points[index! + 3][xy] - prePoint[xy]);
        if (jumpDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) return;
      }

      updPoints.push({
        index,
        x: isHori ? prePoint.x : nextSpaced.x,
        y: isHori ? nextSpaced.y : prePoint.y,
      });
    } else {
      updPoints.push({
        index,
        x: isHori ? prePoint.x : realPoint.x,
        y: isHori ? realPoint.y : prePoint.y,
      });
    }
  }

  if (next) {
    const nextDistance = Math.abs(realPoint[yx] - nextPoint[yx]); // 实时点和相邻点 yx 方向距离
    if (preSpacedDistance >= EDITOR_DEFAULT_ADJUST_DISTANCE && nextDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) return;
    const tempPoint = preSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE ? preSpaced : realPoint;

    tempMemory.next = null;
    newPoints.push({
      x: isHori ? next.x : tempPoint.x,
      y: isHori ? tempPoint.y : next.y,
    }, {
      x: isHori ? next.x : nextPoint.x,
      y: isHori ? nextPoint.y : next.y,
    });
  } else {
    if (nextSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE && nextSpacedDistance <= preSpacedDistance) {
      const count = index === length - 3 ? 1 : 2;
      delInfo.nextCount = count;

      if (index !== length - 3) {
        tempMemory.next = {
          x: isHori ? nextPoint.x : realPoint.x,
          y: isHori ? realPoint.y : nextPoint.y,
        };
      }
    } else if (preSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
      if (points[index! - 2]) {
        const jumpDistance = Math.abs(points[index! - 2][xy] - nextPoint[xy]);
        if (jumpDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) return;
      }

      updPoints.push({
        index: index! + 1,
        x: isHori ? nextPoint.x : preSpaced.x,
        y: isHori ? preSpaced.y : nextPoint.y,
      });
    } else {
      updPoints.push({
        index: index! + 1,
        x: isHori ? nextPoint.x : realPoint.x,
        y: isHori ? realPoint.y : nextPoint.y,
      });
    }
  }

  memoryInfo.pre = tempMemory.pre;
  memoryInfo.next = tempMemory.next;
  memoryInfo.index = tempMemory.index;

  if (updPoints.length) {
    updatePoints(handleLine!, updPoints as IUpdatePointData[]);
    updateSelectItemPoints(targetLine!, handleLine!.points as IPointData[]);
  }

  if (newPoints.length) {
    addPoints(handleLine!, newPoints, index! + 1);
    updateSelectItemPoints(targetLine!, handleLine!.points as IPointData[]);
  }
  
  if (delInfo.preCount || delInfo.nextCount) {
    const { preCount, nextCount } = delInfo;
    const delCount = preCount + nextCount;
    let delIndex = preCount ? (index! - 1 || 1) : index! + 1;

    if (delIndex >= index! + 1) { // 如果删除索引大于新增索引
      delIndex += newPoints.length;
    }
    
    removePoints(targetLine!, delIndex, delCount);
    removePoints(handleLine!, delIndex, delCount);
  }
}