import {
  addPoints,
  isHorizon,
  removePoints,
  getMidPoints,
  updatePoints,
  getFormatPoints,
  showMidEllipses,
} from '../utils';
import {
  Line,
  Rect,
  Group,
  Ellipse,
  sortType,
  ZoomEvent,
  PointerEvent,
} from '@leafer-ui/core';
import {
  EDITOR_DEFAULT_COLOR,
  EDITOR_DEFAULT_Z_INDEX,
  EDITOR_DEFAULT_STROKE_WIDTH,
  EDITOR_DEFAULT_ELLIPSE_WIDTH,
  EDITOR_DEFAULT_ADJUST_DISTANCE,
} from '../constant';
import type {
  IMemoryInfo,
  IOrthoPolylineEditor,
  IOrthoPolylineInputEditor,
} from './type';
import type { 
  ILine,
  IRect,
  IPointData,
  IPointerEvent,
} from '@leafer-ui/interface';
import type {
  IOrthoPolyline,
} from '../OrthoPolyline/type';

export class OrthoPolylineEditor extends Group implements IOrthoPolylineEditor {
  @sortType(EDITOR_DEFAULT_Z_INDEX)
  declare public zIndex: number;

  public color: string;
  public strokeWidth: number;
  public ellipseWidth: number;
  private line: ILine | null;
  private rect: IRect | null;
  private edgeEllipses: Ellipse[];
  private midEllipses: Ellipse[];
  private selectItem: IOrthoPolyline | null;

  /**
   * @description: 构造函数&初始化
   * @return {*}
   */
  constructor (config: IOrthoPolylineInputEditor = {}) {
    const {
      color,
      strokeWidth,
      ellipseWidth,
    } = config;

    super();
    this.color = color ?? EDITOR_DEFAULT_COLOR;
    this.strokeWidth = strokeWidth ?? EDITOR_DEFAULT_STROKE_WIDTH;
    this.ellipseWidth = ellipseWidth ?? EDITOR_DEFAULT_ELLIPSE_WIDTH;
    this.line = null;
    this.rect = null;
    this.selectItem = null;
    this.edgeEllipses = [];
    this.midEllipses = [];
    this.initEvents();
  }

  /**
   * @description: 编辑器初始化事件
   * @return {*}
   */
  private initEvents () {
    this.waitLeafer(() => {
      const { isApp, zoomLayer } = this.app;

      if (isApp && zoomLayer && zoomLayer == this.parent) {
        this.app.on(PointerEvent.DOWN, this.downHandler.bind(this));
        this.app.on(ZoomEvent.ZOOM, this.zoomHandler.bind(this));
      } else {
        throw new Error('OrthoPolylineEditor must be added to the zoomLayer of the App!');
      }
    });
  }

  /**
   * @description: App 点击回调
   * @param {IPointerEvent} e
   * @return {*}
   */
  private downHandler (e: IPointerEvent) {
    const target = e.target as IOrthoPolyline;
    if (target === this.selectItem) return;
    if (target.parent === this) return;

    if (this.selectItem) {
      this.selectItem = null;
      this.clearEditor();
    }

    if (target.tag === 'OrthoPolyline') {
      this.set({
        x: target.x,
        y: target.y,
      });

      this.selectItem = target;
      this.drawEditor();
    }
  }

  /**
   * @description: App 缩放回调
   * @return {*}
   */
  private zoomHandler () {
    if (!this.selectItem) return;

    const { scale } = this.leafer;
    const strokeWidth = this.strokeWidth / (scale as number);
    const width = this.ellipseWidth / (scale as number);

    this.line.setAttr('strokeWidth', strokeWidth);

    this.edgeEllipses.forEach(ellipse => {
      ellipse.set({
        width,
        height: width,
        strokeWidth,
      });
    });
    
    this.midEllipses.forEach(ellipse => {
      ellipse.set({
        width,
        height: width, 
        strokeWidth,
      });
    });
  }

  /**
   * @description: 画编辑器
   * @return {*}
   */
  private drawEditor () {
    const { points } = this.selectItem;
    const edgePoints = getFormatPoints(points);
    const midPoints = getMidPoints(edgePoints);

    this.drawLine(edgePoints);
    this.drawRect();
    this.drawEdgeEllipses(edgePoints);
    this.drawMidEllipses(midPoints);
  }

  /**
   * @description: 清空编辑器
   * @return {*}
   */
  private clearEditor () {
    this.edgeEllipses.forEach(ellipse => {
      ellipse.off(PointerEvent.DOWN);
    });
    
    this.midEllipses.forEach(ellipse => {
      ellipse.off(PointerEvent.DOWN);
    });
    
    this.rect.off(PointerEvent.DOWN);
    this.line = null;
    this.rect = null;
    this.edgeEllipses = [];
    this.midEllipses = [];
    this.clear();
  }

  /**
   * @description: 画边界矩形
   * @return {*}
   */
  private drawRect () {
    const {x, y, width, height } = this.selectItem.boxBounds;
    
    this.rect = new Rect({
      y,
      x,
      width,
      height,
      fill: 'rgba(0, 0, 0, 0)',
    });

    this.add(this.rect);
    this.addRectEvents(this.rect);
  }

  /**
   * @description: 画折线
   * @param {IPointData} points
   * @return {*}
   */
  private drawLine (points: IPointData[] | number[]) {
    const { scale } = this.leafer;
    const width = this.strokeWidth / (scale as number);

    this.line = new Line({
      points,
      stroke: this.color,
      strokeWidth: width,
    });

    this.add(this.line);
  }

  /**
   * @description: 画端点
   * @param {IPointData} points
   * @return {*}
   */
  private drawEdgeEllipses (points: IPointData[]) {
    const { scale } = this.leafer;
    const width = this.ellipseWidth / (scale as number);
    const strokeWidth = this.strokeWidth / (scale as number);

    [points[0], points.at(-1)].forEach((point, index) => {
      const ellipse = new Ellipse({
        width,
        height: width,
        x: point.x,
        y: point.y,
        around: 'center',
        stroke: this.color,
        strokeWidth,
        fill: '#fff',
      });

      this.edgeEllipses.push(ellipse);
      this.addEdgeEvents(ellipse, index);
    });

    this.add(this.edgeEllipses);
  }

  /**
   * @description: 画中点
   * @param {IPointData} points
   * @return {*}
   */
  private drawMidEllipses (points: IPointData[]) {
    const { scale } = this.leafer;
    const width = this.ellipseWidth / (scale as number);
    const strokeWidth = this.strokeWidth / (scale as number);
    const { points: linePoints } = this.selectItem;

    points.forEach((point, index) => {
      const ellipse = new Ellipse({
        width,
        height: width,
        x: point.x,
        y: point.y,
        around: 'center',
        stroke: '#fff',
        strokeWidth,
        fill: this.color,
        visible: showMidEllipses(linePoints as IPointData[], index),
      });

      this.midEllipses.push(ellipse);
      this.addMidEvents(ellipse, index);
    });

    this.add(this.midEllipses);
  }

  /**
   * @description: 给矩形添加事件
   * @param {IRect} rect
   * @return {*}
   */
  private addRectEvents (rect: IRect) {
    rect.on(PointerEvent.DOWN, (e: IPointerEvent) => {
      const { x: originX, y: originY } = this.selectItem;
      const { x: startX, y: startY } = e.getPagePoint();

      const appMoveEventId = this.app.on_(PointerEvent.MOVE, (e: IPointerEvent) => {
        const { x, y } = e.getPagePoint();

        this.selectItem.set({
          x: originX + x - startX,
          y: originY + y - startY,
        });

        this.set({
          x: originX + x - startX,
          y: originY + y - startY,
        });

      });

      rect.on(PointerEvent.UP, () => {
        this.app.off_(appMoveEventId);
        rect.off(PointerEvent.UP);
      });
    });
  }

  /**
   * @description: 给端点添加事件
   * @param {Ellipse} ellipse
   * @param {number} index
   * @return {*}
   */
  private addEdgeEvents (ellipse: Ellipse, index: number) {
    ellipse.on(PointerEvent.DOWN, (e: IPointerEvent) => {
      const { x: originX, y: originY } = ellipse;
      const startPoint = e.getPagePoint();
      const originPoint = { 
        x: originX,
        y: originY,
      };
      const memoryInfo: IMemoryInfo = {
        side: null,
        spaced: null,
      };
      
      const appMoveEventId = this.app.on_(PointerEvent.MOVE, (e: IPointerEvent) => {
        const point = e.getPagePoint();
        
        if (this.edgeEllipses.length || this.midEllipses.length) {
          this.removeEllipses();
        }

        this.handleEdgeMove(originPoint, startPoint, point, index, memoryInfo);
      });

      ellipse.on(PointerEvent.UP, () => {
        this.redrawEllipses();
        this.rect.set(this.selectItem.boxBounds);
        this.app.off_(appMoveEventId);
        ellipse.off(PointerEvent.UP);
        ellipse.off(PointerEvent.DOWN);
      });
    });
  }

  /**
   * @description: 给中点添加事件
   * @param {Ellipse} ellipse
   * @param {number} index
   * @return {*}
   */
  private addMidEvents (ellipse: Ellipse, index: number) {
    ellipse.on(PointerEvent.DOWN, (e: IPointerEvent) => {
      const { x: originX, y: originY } = ellipse;
      const startPoint = e.getPagePoint();
      const originPoint = { 
        x: originX,
        y: originY,
      };
      const memoryInfo: IMemoryInfo = {
        index,
        pre: null,
        next: null,
      };

      const appMoveEventId = this.app.on_(PointerEvent.MOVE, (e: IPointerEvent) => {
        const point = e.getPagePoint();

        if (this.edgeEllipses.length || this.midEllipses.length) {
          this.removeEllipses();
        }

        this.handleMidMove(originPoint, startPoint, point, memoryInfo);
      });

      ellipse.on(PointerEvent.UP, () => {
        this.redrawEllipses();
        this.rect.set(this.selectItem.boxBounds);
        this.app.off_(appMoveEventId);
        ellipse.off(PointerEvent.UP);
        ellipse.off(PointerEvent.DOWN);
      });
    }) 
  }

  /**
   * @description: 处理端点移动
   * @param {IPointData} originPoint
   * @param {IPointData} startPoint
   * @param {IPointData} point
   * @param {number} index
   * @param {IMemoryInfo} memoryInfo
   * @return {*}
   */
  private handleEdgeMove (originPoint: IPointData, startPoint: IPointData, point: IPointData, index: number, memoryInfo: IMemoryInfo) {
    const { x, y } = point;
    const { points } = this.selectItem;
    const { x: originX, y: originY } = originPoint;
    const { x: startX, y: startY } = startPoint;
    const length = points.length;
    const isFirst = index === 0; // 是否起点
    const realPoint = {
      x: originX + x - startX,
      y: originY + y - startY,
    };

    if (length === 2) { // 两个点时的处理逻辑
      this.handleTwoPoints(isFirst, realPoint, points as IPointData[], memoryInfo);
    } else { // 多个点时的处理逻辑
      this.handleMultiPoints(isFirst, realPoint, points as IPointData[], memoryInfo);
    }
  }

  /**
   * @description: 处理两个点的情况，主要为了压缩代码，所以可读性较差
   * @param {boolean} isFirst
   * @param {IPointData} realPoint
   * @param {IPointData} points
   * @param {IMemoryInfo} memoryInfo
   * @return {*}
   */
  private handleTwoPoints (isFirst: boolean, realPoint: IPointData, points: IPointData[], memoryInfo: IMemoryInfo) {
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
      const { side, spaced } = memoryInfo;

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
        isFirst ? newPoints.push(pointA, pointB) : newPoints.push(pointB, pointA);
      }
    }

    if (updPoints.length) {
      updatePoints(this.selectItem, updPoints);
      updatePoints(this.line, updPoints);
    }

    if (newPoints.length) {
      addPoints(this.selectItem, newPoints, 1);
      addPoints(this.line, newPoints, 1);
    }
  }

  /**
   * @description: 处理多个点的情况，主要为了压缩代码，所以可读性较差
   * @param {boolean} isFirst
   * @param {IPointData} realPoint
   * @param {IPointData} points
   * @param {IMemoryInfo} memoryInfo
   * @return {*}
   */  
  private handleMultiPoints (isFirst: boolean, realPoint: IPointData, points: IPointData[], memoryInfo: IMemoryInfo) {
    const { side, spaced } = memoryInfo;
    const length = points.length; // 点的个数
    const curPoint = isFirst ? points[0] : points.at(-1); // 当前点
    const sidePoint = isFirst ? points[1] : points.at(-2); // 相邻的点
    const spacedPoint = isFirst ? points[2] : points.at(-3); // 间隔的点
    const spacedTwoPoint = isFirst? points[3] : points.at(-4); // 间隔两个的点
    const isHori = isHorizon(curPoint, sidePoint);
    const uIndex = isFirst ? 0 : length - 1;
    const hIndex = isFirst ? 1 : length - 2;
    const xy = isHori ? 'x' : 'y'; // 用到的 x 或 y
    const yx = isHori ? 'y' : 'x'; // 用到的 y 或 x
    const distance = Math.abs(realPoint[yx] - sidePoint[yx]); // 第一个点和第二个点的 yx 方向距离
    const oppoDistance = Math.abs(realPoint[xy] - sidePoint[xy]); // 第一个点和第二个点的 xy 方向距离
    const spacedDistance = Math.abs(realPoint[yx] - spacedPoint[yx]); // 第一个点和第三个点的 yx 方向距离
    const oppoSpacedDistance = Math.abs(realPoint[xy] - spacedPoint[xy]); // 第一个点和第三个点的 xy 方向距离
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
          if (Math.abs(spaced[xy] - realPoint[xy]) < EDITOR_DEFAULT_ADJUST_DISTANCE) {
            return;
          }

          const pointA = {
            x: isHori ? spaced.x : realPoint.x,
            y: isHori ? realPoint.y : spaced.y,
          };
          const pointB = {
            x: isHori ? spaced.x : sidePoint.x,
            y: isHori ? sidePoint.y : spaced.y,
          };
          
          memoryInfo.spaced = null;
          isFirst ? newPoints.push(pointA, pointB) : newPoints.push(pointB, pointA);
        }
      }
    } else {
      if (oppoDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
        updPoints.push({
          index: uIndex,
          x: isHori ? sidePoint.x : realPoint.x,
          y: isHori ? realPoint.y : sidePoint.y,
        });
  
        memoryInfo.side = {
          x: isHori ? sidePoint.x : realPoint.x,
          y: isHori ? realPoint.y : sidePoint.y,
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
          x: isHori ? realPoint.x : spacedPoint.x,
          y: isHori ? spacedPoint.y : realPoint.y,
        });
  
        memoryInfo.spaced = {
          x: isHori ? sidePoint.x : spacedPoint.x,
          y: isHori ? spacedPoint.y : sidePoint.y,
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
          x: isHori ? sidePoint.x : realPoint.x,
          y: isHori ? realPoint.y : sidePoint.y,
        });
      }
    }

    if (updPoints.length) {
      updatePoints(this.line, updPoints);
      updatePoints(this.selectItem, updPoints);
    }

    if (newPoints.length) {
      const addIndex = isFirst ? 1 : length - 1;
      
      addPoints(this.selectItem, newPoints, addIndex);
      addPoints(this.line, newPoints, addIndex);
    }

    if (delInfo) {
      const { index, count } = delInfo;
      
      removePoints(this.selectItem, index, count);
      removePoints(this.line, index, count);
    }
  }

  /**
   * @description: 处理中点移动
   * @param {IPointData} originPoint
   * @param {IPointData} startPoint
   * @param {IPointData} point
   * @param {number} index
   * @param {IMemoryInfo} memoryInfo
   * @return {*}
   */
  private handleMidMove (originPoint: IPointData, startPoint: IPointData, point: IPointData, memoryInfo: IMemoryInfo) {
    const { x, y } = point;
    const points = this.selectItem.points as IPointData[];
    const length = points.length;
    const { index } = memoryInfo;
    const { x: originX, y: originY } = originPoint;
    const { x: startX, y: startY } = startPoint;
    const realPoint = {
      x: originX + x - startX,
      y: originY + y - startY,
    };

    if (index === 0 || index === length - 2) {
      this.handleEdgeLine(realPoint, points, memoryInfo);
    } else {
      this.handleOtherLine(realPoint, points, memoryInfo);
    }
  }

  private handleEdgeLine (realPoint: IPointData, points: IPointData[], memoryInfo: IMemoryInfo) {
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
      tempMemory.index += 2;
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
        tempMemory.index += 1;
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
      updatePoints(this.selectItem, updPoints);
      updatePoints(this.line, updPoints);
    }

    if (newPoints.length) {
      const aIndex = index === 0 ? 1 : length - 1;

      addPoints(this.selectItem, newPoints, aIndex);
      addPoints(this.line, newPoints, aIndex);
    }
  }

  private handleOtherLine (realPoint: IPointData, points: IPointData[], memoryInfo: IMemoryInfo) {
    const { pre, next, index } = memoryInfo;
    const tempMemory = {...memoryInfo};
    const length = points.length;
    const preSpaced = points[index - 1];
    const prePoint = points[index];
    const nextPoint = points[index + 1];
    const nextSpaced = points[index + 2];
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

      tempMemory.index += 2;
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
        tempMemory.index -= count;

        if (index !== 1) {
          tempMemory.pre = {
            x: isHori ? prePoint.x : realPoint.x,
            y: isHori ? realPoint.y : prePoint.y,
          };
        }
      } else if (nextSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
        if (points[index + 3]) {
          const jumpDistance = Math.abs(points[index + 3][xy] - prePoint[xy]);
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
        if (points[index - 2]) {
          const jumpDistance = Math.abs(points[index - 2][xy] - nextPoint[xy]);
          if (jumpDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) return;
        }

        updPoints.push({
          index: index + 1,
          x: isHori ? nextPoint.x : preSpaced.x,
          y: isHori ? preSpaced.y : nextPoint.y,
        });
      } else {
        updPoints.push({
          index: index + 1,
          x: isHori ? nextPoint.x : realPoint.x,
          y: isHori ? realPoint.y : nextPoint.y,
        });
      }
    }

    memoryInfo.pre = tempMemory.pre;
    memoryInfo.next = tempMemory.next;
    memoryInfo.index = tempMemory.index;

    if (updPoints.length) {
      updatePoints(this.selectItem, updPoints);
      updatePoints(this.line, updPoints);
    }

    if (newPoints.length) {
      addPoints(this.selectItem, newPoints, index + 1);
      addPoints(this.line, newPoints, index + 1);
    }
    
    if (delInfo.preCount || delInfo.nextCount) {
      const { preCount, nextCount } = delInfo;
      const delCount = preCount + nextCount;
      let delIndex = preCount ? (index - 1 || 1) : index + 1;

      if (delIndex >= index + 1) { // 如果删除索引大于新增索引
        delIndex += newPoints.length;
      }
      
      removePoints(this.selectItem, delIndex, delCount);
      removePoints(this.line, delIndex, delCount);
    }
  }

  /**
   * @description: 重绘操控点
   * @return {*}
   */
  private redrawEllipses () {
    const { points } = this.selectItem;
    const midPoints = getMidPoints(points as IPointData[]);

    this.drawEdgeEllipses(points as IPointData[]);
    this.drawMidEllipses(midPoints);
  }

  /**
   * @description: 移除操控点
   * @return {*}
   */
  private removeEllipses () {
    this.edgeEllipses.forEach(ellipse => {
      ellipse.remove();
    });

    this.midEllipses.forEach(ellipse => {
      ellipse.remove();
    });

    this.edgeEllipses = [];
    this.midEllipses = [];
  }
}