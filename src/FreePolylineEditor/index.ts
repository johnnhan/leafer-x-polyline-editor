import {
  addPoints,
  updatePoints,
  getMidPoints,
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
} from '../constant';
import type {
  IFreePolylineEditor,
  IFreePolylineInputEditor,
} from './type';
import type { 
  ILine,
  IRect,
  IPointData,
  IPointerEvent,
} from '@leafer-ui/interface';
import type {
  IFreePolyline,
} from '../FreePolyline/type';

export class FreePolylineEditor extends Group implements IFreePolylineEditor {
  @sortType(EDITOR_DEFAULT_Z_INDEX)
  declare public zIndex: number;

  public color: string;
  public strokeWidth: number;
  public ellipseWidth: number;
  private line: ILine | null;
  private rect: IRect | null;
  private edgeEllipses: Ellipse[];
  private midEllipses: Ellipse[];
  private selectItem: IFreePolyline | null;

  /**
   * @description: 构造函数&初始化
   * @return {*}
   */
  constructor (config: IFreePolylineInputEditor = {}) {
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
        throw new Error('FreePolylineEditor must be added to the zoomLayer of the App!');
      }
    });
  }

  /**
   * @description: App 点击回调
   * @param {IPointerEvent} e
   * @return {*}
   */
  private downHandler (e: IPointerEvent) {
    const target = e.target as IFreePolyline;
    if (target === this.selectItem) return;
    if (target.parent === this) return;

    if (this.selectItem) {
      this.selectItem = null;
      this.clearEditor();
    }

    if (target.tag === 'FreePolyline') {
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

    points.forEach((point, index) => {
      const ellipse = new Ellipse({
        width,
        height: width,
        x: point.x,
        y: point.y,
        around: 'center',
        stroke: this.color,
        strokeWidth,
        fill: '#fff',
        draggable: true,
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
      const { x: startX, y: startY } = e.getPagePoint();

      const appMoveEventId = this.app.on_(PointerEvent.MOVE, (e: IPointerEvent) => {
        const { x, y } = e.getPagePoint();
        const prePoint = {
          index,
          x: originX + x - startX,
          y: originY + y - startY,
        };

        if (this.edgeEllipses.length || this.midEllipses.length) {
          this.removeEllipses();
        }

        updatePoints(this.line, [prePoint]);
        updatePoints(this.selectItem, [prePoint]);
      });

      ellipse.on(PointerEvent.UP, () => {
        this.app.off_(appMoveEventId);
        ellipse.off(PointerEvent.UP);
        ellipse.off(PointerEvent.DOWN);
        this.redrawEllipses();
        this.rect.set(this.selectItem.boxBounds);
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
      const { x: startX, y: startY } = e.getPagePoint();
      let hasInsert = false;

      const appMoveEventId = this.app.on_(PointerEvent.MOVE, (e:IPointerEvent) => {
        const { x, y } = e.getPagePoint();
        const newPoint = {
          x: originX + x - startX,
          y: originY + y - startY,
        }
        const prePoint = {
          ...newPoint,
          index: index + 1,
        };

        if (this.edgeEllipses.length || this.midEllipses.length) {
          this.removeEllipses();
        }

        if (hasInsert) {
          updatePoints(this.line, [prePoint]);
          updatePoints(this.selectItem, [prePoint]);
        } else {
          hasInsert = true;
          addPoints(this.line, [newPoint], index + 1);
          addPoints(this.selectItem, [newPoint], index + 1);
        }
      });

      ellipse.on(PointerEvent.UP, () => {
        this.app.off_(appMoveEventId);
        ellipse.off(PointerEvent.UP);
        ellipse.off(PointerEvent.DOWN);
        this.redrawEllipses();
        this.rect.set(this.selectItem.boxBounds);
      });
    }) 
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