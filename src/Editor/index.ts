import {
  Line,
  Group,
  Ellipse,
  MoveEvent,
  ZoomEvent,
  DragEvent,
  createAttr,
  PointerEvent,
  dataProcessor,
} from '@leafer-ui/core';
import {
  getMidPoints,
} from '../utils';
import {
  EDITOR_DEFAULT_COLOR,
  EDITOR_DEFAULT_STROKE_WIDTH,
  EDITOR_DEFAULT_ELLIPSE_WIDTH,
  POLYLINE_DEFAULT_STROKE_CAP,
  POLYLINE_DEFAULT_STROKE_JOIN,
} from '../constant';
import { PolylineEditorData } from './data';
import { 
  handleEdgeMove as orthoEdgeMove,
  handleMidMove as orthoMidMove,
  showMidEllipses as showOrthoMid,
} from './ortho';
import { 
  handleEdgeMove as freeEdgeMove,
  handleMidMove as freeMidMove,
  showMidEllipses as showFreeMid,
} from './free';

import type { 
  ILine,
  IPointData,
  IPointerEvent,
} from '@leafer-ui/interface';
import type {
  IMemoryInfo,
  IPolylineEditor,
  IPolylineEditorData,
  IPolylineInputEditor,
} from './type';
import type {
  IPolyline,
} from '../type';

export class PolylineEditor extends Group implements IPolylineEditor {
  @dataProcessor(PolylineEditorData)
  declare public __: IPolylineEditorData;

  @createAttr(EDITOR_DEFAULT_COLOR)
  declare public color: string;

  @createAttr(EDITOR_DEFAULT_STROKE_WIDTH)
  declare public strokeWidth: number;

  @createAttr(EDITOR_DEFAULT_ELLIPSE_WIDTH)
  declare public ellipseWidth: number;

  private line: ILine | null;
  private edgeEllipses: Ellipse[];
  private midEllipses: Ellipse[];
  private selectItem: IPolyline | null;

  /**
   * @description: 构造函数&初始化
   * @return {*}
   */
  constructor (config?: IPolylineInputEditor) {
    super(config);
    this.line = null;
    this.selectItem = null;
    this.edgeEllipses = [];
    this.midEllipses = [];
    this.initEvents();
  }

  /**
   * @description: 自定义元素标签
   * @return {*}
   */
  public get __tag () { 
    return 'PolylineEditor';
  }

  /**
   * @description: 编辑器初始化事件
   * @return {*}
   */
  private initEvents () {
    this.waitLeafer(() => {
      const { isApp, sky } = this.app;

      if (isApp && this.parent === sky) {
        this.app.on(PointerEvent.DOWN, this.downHandler.bind(this));
        this.app.on(PointerEvent.DOUBLE_TAP, this.doubleTapHandler.bind(this));
        this.app.on(ZoomEvent.ZOOM, this.redrawEditor.bind(this));
        this.app.on(MoveEvent.MOVE, this.redrawEditor.bind(this));
      } else {
        throw new Error('PolylineEditor must be added to the zoomLayer of the App!');
      }
    });
  }

  /**
   * @description: App 点击回调
   * @param {IPointerEvent} e
   * @return {*}
   */
  private downHandler (e: IPointerEvent) {
    if (this.app.mode !== 'normal') return; // 仅在正常模式下响应点击事件
    if (![1, 2].includes(e.buttons)) return; // 仅响应左键和中键点击事件
    const target = e.target as IPolyline;
    if (target.parent === this) return; // 点击编辑器自身，不响应

    this.select(target);
  }

  /**
   * @description: App 双击回调
   * @param {IPointerEvent} e
   * @return {*}
   */
  private doubleTapHandler (e: IPointerEvent) {
    if (this.app.mode !== 'normal') return;
    if (!this.selectItem) return;
    const target = e.target as IPolyline;
    if (target.parent === this) return;
    
    this.emit('double-tap', { target: this.selectItem! });
  }

  /**
   * @description: 画编辑器
   * @return {*}
   */
  private drawEditor () {
    const { points, editConfig } = this.selectItem;
    const { moveable } = editConfig;
    const edgePoints = (points as IPointData[]).map((point: IPointData) => this.selectItem!.getWorldPoint(point));

    this.drawLine(edgePoints);
    
    if (moveable) { // 可编辑
      const midPoints = getMidPoints(edgePoints);
      this.drawEdgeEllipses(edgePoints);
      this.drawMidEllipses(midPoints);
    }
  }

  /**
   * @description: 清空编辑器相关
   * @return {*}
   */
  private clearEditor () {
    this.edgeEllipses.forEach(ellipse => {
      ellipse.off(DragEvent.DRAG);
      ellipse.off(DragEvent.END);
      ellipse.destroy();
    });
    
    this.midEllipses.forEach(ellipse => {
      ellipse.off(DragEvent.DRAG);
      ellipse.off(DragEvent.END);
      ellipse.destroy();
    });

    if (this.line) {
      this.line.destroy();
      this.line = null;
    }
    
    this.edgeEllipses = [];
    this.midEllipses = [];
    this.clear();
  }

  /**
   * @description: 画折线
   * @param {IPointData} points
   * @return {*}
   */
  private drawLine (points: IPointData[] | number[]) {
    const {
      color,
      strokeWidth,
    } = this;

    this.line = new Line({
      points,
      hittable: false,
      name: 'editor-line',
      stroke: color,
      strokeWidth,
      strokeCap: POLYLINE_DEFAULT_STROKE_CAP,
      strokeJoin: POLYLINE_DEFAULT_STROKE_JOIN,
    });

    this.add(this.line);
  }

  /**
   * @description: 画端点
   * @param {IPointData} points
   * @return {*}
   */
  private drawEdgeEllipses (points: IPointData[]) {
    const { tag } = this.selectItem!;
    const finalPoints = tag === 'FreePolyline' ? points : [points[0], points.at(-1)];
    const {
      color,
      ellipseWidth,
      strokeWidth,
    } = this;

    finalPoints.forEach((point, index) => {
      const ellipse = new Ellipse({
        width: ellipseWidth,
        height: ellipseWidth,
        x: point!.x,
        y: point!.y,
        draggable: true,
        name: `polyline-editor-point-${index === 0 ? 'start' : 'end'}`,
        around: 'center',
        stroke: color,
        strokeWidth,
        strokeAlign: 'center',
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
    const { tag } = this.selectItem!;
    const linePoints = this.line!.points as IPointData[];
    const {
      color,
      ellipseWidth,
      strokeWidth,
    } = this;

    points.forEach((point, index) => {
      const ellipse = new Ellipse({
        width: ellipseWidth,
        height: ellipseWidth,
        x: point.x,
        y: point.y,
        draggable: true,
        name: 'polyline-editor-point',
        around: 'center',
        stroke: '#fff',
        strokeWidth: strokeWidth - 1,
        strokeAlign: 'center',
        fill: color,
        visible: tag === 'OrthoPolyline' 
          ? showOrthoMid(linePoints, index) 
          : showFreeMid(linePoints, index),
      });

      this.midEllipses.push(ellipse);
      this.addMidEvents(ellipse, index);
    });

    this.add(this.midEllipses);
  }

  /**
   * @description: 给端点添加事件
   * @param {Ellipse} ellipse
   * @param {number} index
   * @return {*}
   */
  private addEdgeEvents (ellipse: Ellipse, index: number) {
    const { tag } = this.selectItem!;
    const length = this.line!.points!.length;
    const memoryInfo: IMemoryInfo = {
      length,
      index,
      side: null,
      spaced: null,
    };

    ellipse.on(DragEvent.START, () => {
      this.hideEllipses();
      this.emit('drag-start', { 
        target: this.selectItem,
        current: ellipse,
      });
    });

    ellipse.on(DragEvent.DRAG, () => {
      const { x, y } = ellipse;
      const point = { x, y };

      if (tag === 'OrthoPolyline') {
        orthoEdgeMove(point as IPointData, memoryInfo, this.line, this.selectItem);
      } else if (tag === 'FreePolyline') {
        freeEdgeMove(point as IPointData, memoryInfo, this.line, this.selectItem);
      }

      this.emit('drag', {
        target: this.selectItem,
        current: ellipse,
      });
    });

    ellipse.on(DragEvent.END, () => {
      ellipse.off(DragEvent.DRAG);
      ellipse.off(DragEvent.END);
      this.redrawEditor();
      this.emit('drag-end', { 
        target: this.selectItem,
        current: ellipse,
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
    const { tag } = this.selectItem!;
    const length = this.line!.points!.length;
    const memoryInfo: IMemoryInfo = {
      length,
      index,
      pre: null,
      next: null,
    };

    ellipse.on(DragEvent.START, () => {
      this.hideEllipses();
      this.emit('drag-start', { 
        target: this.selectItem,
        current: ellipse,
      });
    });

    ellipse.on(DragEvent.DRAG, () => {
      const { x, y } = ellipse;
      const point = { x, y };

      if (tag === 'OrthoPolyline') {
        orthoMidMove(point as IPointData, memoryInfo, this.line, this.selectItem);
      } else if (tag === 'FreePolyline') {
        freeMidMove(point as IPointData, memoryInfo, this.line, this.selectItem);
      }

      this.emit('drag', { 
        target: this.selectItem,
        current: ellipse,
      });
    });

    ellipse.on(DragEvent.END, () => {
      ellipse.off(DragEvent.DRAG);
      ellipse.off(DragEvent.END);
      this.redrawEditor();
      this.emit('drag-end', { 
        target: this.selectItem,
        current: ellipse,
      });
    });
  }

  /**
   * @description: 重绘编辑器
   * @return {*}
   */
  public redrawEditor () {
    if (this.selectItem) {
      this.clearEditor();
      this.drawEditor();
    }
  }

  /**
   * @description: 隐藏操控点
   * @return {*}
   */
  private hideEllipses () {
    this.edgeEllipses.forEach(ellipse => {
      ellipse.setAttr('visible', false);
    });

    this.midEllipses.forEach(ellipse => {
      ellipse.setAttr('visible', false);
    });
  }

  /**
   * @description: 选中元素
   * @param {IOrthoPolyline} line
   * @return {*}
   */
  public select (line: IPolyline) {
    if (line === this.selectItem) return;
    const oldValue = this.selectItem;

    if (this.selectItem) {
      this.clearEditor();
      this.selectItem = null;
    }

    if (['OrthoPolyline', 'FreePolyline'].includes(line.tag)) {
      this.selectItem = line;
      this.drawEditor();
    }

    this.emit('select', {
      oldValue,
      value: this.selectItem,
    });
  }

  
  /**
   * @description: 取消选中元素
   * @return {*}
   */
  public cancel () {
    this.clearEditor();
    this.emit('select', {
      oldValue: this.selectItem,
      value: null,
    });
  }
}