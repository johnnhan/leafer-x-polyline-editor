import { ArrowData, Arrow } from '@leafer-in/arrow';
import { boundsType, dataProcessor, registerUI, sortType, Group, PointerEvent, ZoomEvent, Rect, Line, Ellipse } from '@leafer-ui/core';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class FreePolylineData extends ArrowData {
}

const EDITOR_DEFAULT_COLOR = '#1890FF';
const EDITOR_DEFAULT_Z_INDEX = 99999999;
const EDITOR_DEFAULT_STROKE_WIDTH = 2;
const EDITOR_DEFAULT_ELLIPSE_WIDTH = 10;
const EDITOR_DEFAULT_ADJUST_DISTANCE = 10;
const POLYLINE_DEFAULT_STROKE_CAP = 'round';
const POLYLINE_DEFAULT_STROKE_JOIN = 'round';
const POLYLINE_DEFAULT_START_ARROW = 'none';
const POLYLINE_DEFAULT_END_ARROW = 'none';

let FreePolyline = class FreePolyline extends Arrow {
    get __tag() {
        return 'FreePolyline';
    }
    constructor(data) {
        super(data);
    }
};
__decorate([
    boundsType(POLYLINE_DEFAULT_STROKE_CAP)
], FreePolyline.prototype, "strokeCap", void 0);
__decorate([
    boundsType(POLYLINE_DEFAULT_STROKE_JOIN)
], FreePolyline.prototype, "strokeJoin", void 0);
__decorate([
    boundsType(POLYLINE_DEFAULT_START_ARROW)
], FreePolyline.prototype, "startArrow", void 0);
__decorate([
    boundsType(POLYLINE_DEFAULT_END_ARROW)
], FreePolyline.prototype, "endArrow", void 0);
__decorate([
    dataProcessor(FreePolylineData)
], FreePolyline.prototype, "__", void 0);
FreePolyline = __decorate([
    registerUI()
], FreePolyline);

class OrthoPolylineData extends ArrowData {
}

function getMidPoints(points) {
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
function getFormatPoints(points) {
    if (!points.length)
        return points;
    if (isPointData(points))
        return points;
    return points.reduce((acc, cur, index, arr) => {
        if (index % 2) {
            acc.push({
                x: arr[index - 1],
                y: cur,
            });
        }
        return acc;
    }, []);
}
function isPointData(points) {
    return points.length && typeof points[0] === 'object';
}
function isHorizon(point1, point2) {
    return point1.y === point2.y && point1.x !== point2.x;
}
function isVertical(point1, point2) {
    return point1.x === point2.x && point1.y !== point2.y;
}
function addPoints(line, points, index) {
    const newPoints = [...line.points];
    newPoints.splice(index, 0, ...points);
    line.setAttr('points', newPoints);
}
function removePoints(line, index, count) {
    const newPoints = [...line.points];
    newPoints.splice(index, count);
    line.setAttr('points', newPoints);
}
function updatePoints(line, points) {
    const newPoints = [...line.points];
    points.forEach(point => {
        const { index, x, y } = point;
        newPoints[index] = { x, y };
    });
    line.setAttr('points', newPoints);
}
function showMidEllipses(points, index) {
    const prePoint = points[index];
    const nextPoint = points[index + 1];
    const isHori = isHorizon(prePoint, nextPoint);
    return isHori
        ? Math.abs(prePoint.x - nextPoint.x) >= EDITOR_DEFAULT_ADJUST_DISTANCE * 2
        : Math.abs(prePoint.y - nextPoint.y) >= EDITOR_DEFAULT_ADJUST_DISTANCE * 2;
}

let OrthoPolyline = class OrthoPolyline extends Arrow {
    get __tag() {
        return 'OrthoPolyline';
    }
    constructor(data) {
        super(data);
        if (!this.isOrthoLine(getFormatPoints(this.points))) {
            throw new Error('Params points can\'t paint an orthogonal polylines!');
        }
    }
    isOrthoLine(points) {
        if (points.length < 2)
            return false;
        return points.every((point, index, arr) => {
            if (index === 0) {
                return true;
            }
            else {
                if (isHorizon(arr[index - 1], point)) {
                    return arr[index - 2]
                        ? isVertical(arr[index - 2], arr[index - 1])
                        : true;
                }
                else if (isVertical(arr[index - 1], point)) {
                    return arr[index - 2]
                        ? isHorizon(arr[index - 2], arr[index - 1])
                        : true;
                }
                else {
                    return false;
                }
            }
        });
    }
};
__decorate([
    boundsType(POLYLINE_DEFAULT_STROKE_CAP)
], OrthoPolyline.prototype, "strokeCap", void 0);
__decorate([
    boundsType(POLYLINE_DEFAULT_STROKE_JOIN)
], OrthoPolyline.prototype, "strokeJoin", void 0);
__decorate([
    boundsType(POLYLINE_DEFAULT_START_ARROW)
], OrthoPolyline.prototype, "startArrow", void 0);
__decorate([
    boundsType(POLYLINE_DEFAULT_END_ARROW)
], OrthoPolyline.prototype, "endArrow", void 0);
__decorate([
    dataProcessor(OrthoPolylineData)
], OrthoPolyline.prototype, "__", void 0);
OrthoPolyline = __decorate([
    registerUI()
], OrthoPolyline);

class FreePolylineEditor extends Group {
    constructor(config = {}) {
        const { color, strokeWidth, ellipseWidth, } = config;
        super();
        this.color = color !== null && color !== void 0 ? color : EDITOR_DEFAULT_COLOR;
        this.strokeWidth = strokeWidth !== null && strokeWidth !== void 0 ? strokeWidth : EDITOR_DEFAULT_STROKE_WIDTH;
        this.ellipseWidth = ellipseWidth !== null && ellipseWidth !== void 0 ? ellipseWidth : EDITOR_DEFAULT_ELLIPSE_WIDTH;
        this.line = null;
        this.rect = null;
        this.selectItem = null;
        this.edgeEllipses = [];
        this.midEllipses = [];
        this.initEvents();
    }
    initEvents() {
        this.waitLeafer(() => {
            const { isApp, zoomLayer } = this.app;
            if (isApp && zoomLayer && zoomLayer == this.parent) {
                this.app.on(PointerEvent.DOWN, this.downHandler.bind(this));
                this.app.on(ZoomEvent.ZOOM, this.zoomHandler.bind(this));
            }
            else {
                throw new Error('FreePolylineEditor must be added to the zoomLayer of the App!');
            }
        });
    }
    downHandler(e) {
        const target = e.target;
        if (target === this.selectItem)
            return;
        if (target.parent === this)
            return;
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
    zoomHandler() {
        if (!this.selectItem)
            return;
        const { scale } = this.leafer;
        const strokeWidth = this.strokeWidth / scale;
        const width = this.ellipseWidth / scale;
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
    drawEditor() {
        const { points } = this.selectItem;
        const edgePoints = getFormatPoints(points);
        const midPoints = getMidPoints(edgePoints);
        this.drawLine(edgePoints);
        this.drawRect();
        this.drawEdgeEllipses(edgePoints);
        this.drawMidEllipses(midPoints);
    }
    clearEditor() {
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
    drawRect() {
        const { x, y, width, height } = this.selectItem.boxBounds;
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
    drawLine(points) {
        const { scale } = this.leafer;
        const width = this.strokeWidth / scale;
        this.line = new Line({
            points,
            stroke: this.color,
            strokeWidth: width,
        });
        this.add(this.line);
    }
    drawEdgeEllipses(points) {
        const { scale } = this.leafer;
        const width = this.ellipseWidth / scale;
        const strokeWidth = this.strokeWidth / scale;
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
    drawMidEllipses(points) {
        const { scale } = this.leafer;
        const width = this.ellipseWidth / scale;
        const strokeWidth = this.strokeWidth / scale;
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
                visible: showMidEllipses(linePoints, index),
            });
            this.midEllipses.push(ellipse);
            this.addMidEvents(ellipse, index);
        });
        this.add(this.midEllipses);
    }
    addRectEvents(rect) {
        rect.on(PointerEvent.DOWN, (e) => {
            const { x: originX, y: originY } = this.selectItem;
            const { x: startX, y: startY } = e.getPagePoint();
            const appMoveEventId = this.app.on_(PointerEvent.MOVE, (e) => {
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
    addEdgeEvents(ellipse, index) {
        ellipse.on(PointerEvent.DOWN, (e) => {
            const { x: originX, y: originY } = ellipse;
            const { x: startX, y: startY } = e.getPagePoint();
            const appMoveEventId = this.app.on_(PointerEvent.MOVE, (e) => {
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
    addMidEvents(ellipse, index) {
        ellipse.on(PointerEvent.DOWN, (e) => {
            const { x: originX, y: originY } = ellipse;
            const { x: startX, y: startY } = e.getPagePoint();
            let hasInsert = false;
            const appMoveEventId = this.app.on_(PointerEvent.MOVE, (e) => {
                const { x, y } = e.getPagePoint();
                const newPoint = {
                    x: originX + x - startX,
                    y: originY + y - startY,
                };
                const prePoint = Object.assign(Object.assign({}, newPoint), { index: index + 1 });
                if (this.edgeEllipses.length || this.midEllipses.length) {
                    this.removeEllipses();
                }
                if (hasInsert) {
                    updatePoints(this.line, [prePoint]);
                    updatePoints(this.selectItem, [prePoint]);
                }
                else {
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
        });
    }
    redrawEllipses() {
        const { points } = this.selectItem;
        const midPoints = getMidPoints(points);
        this.drawEdgeEllipses(points);
        this.drawMidEllipses(midPoints);
    }
    removeEllipses() {
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
__decorate([
    sortType(EDITOR_DEFAULT_Z_INDEX)
], FreePolylineEditor.prototype, "zIndex", void 0);

class OrthoPolylineEditor extends Group {
    constructor(config = {}) {
        const { color, strokeWidth, ellipseWidth, } = config;
        super();
        this.color = color !== null && color !== void 0 ? color : EDITOR_DEFAULT_COLOR;
        this.strokeWidth = strokeWidth !== null && strokeWidth !== void 0 ? strokeWidth : EDITOR_DEFAULT_STROKE_WIDTH;
        this.ellipseWidth = ellipseWidth !== null && ellipseWidth !== void 0 ? ellipseWidth : EDITOR_DEFAULT_ELLIPSE_WIDTH;
        this.line = null;
        this.rect = null;
        this.selectItem = null;
        this.edgeEllipses = [];
        this.midEllipses = [];
        this.initEvents();
    }
    initEvents() {
        this.waitLeafer(() => {
            const { isApp, zoomLayer } = this.app;
            if (isApp && zoomLayer && zoomLayer == this.parent) {
                this.app.on(PointerEvent.DOWN, this.downHandler.bind(this));
                this.app.on(ZoomEvent.ZOOM, this.zoomHandler.bind(this));
            }
            else {
                throw new Error('OrthoPolylineEditor must be added to the zoomLayer of the App!');
            }
        });
    }
    downHandler(e) {
        const target = e.target;
        if (target === this.selectItem)
            return;
        if (target.parent === this)
            return;
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
    zoomHandler() {
        if (!this.selectItem)
            return;
        const { scale } = this.leafer;
        const strokeWidth = this.strokeWidth / scale;
        const width = this.ellipseWidth / scale;
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
    drawEditor() {
        const { points } = this.selectItem;
        const edgePoints = getFormatPoints(points);
        const midPoints = getMidPoints(edgePoints);
        this.drawLine(edgePoints);
        this.drawRect();
        this.drawEdgeEllipses(edgePoints);
        this.drawMidEllipses(midPoints);
    }
    clearEditor() {
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
    drawRect() {
        const { x, y, width, height } = this.selectItem.boxBounds;
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
    drawLine(points) {
        const { scale } = this.leafer;
        const width = this.strokeWidth / scale;
        this.line = new Line({
            points,
            stroke: this.color,
            strokeWidth: width,
        });
        this.add(this.line);
    }
    drawEdgeEllipses(points) {
        const { scale } = this.leafer;
        const width = this.ellipseWidth / scale;
        const strokeWidth = this.strokeWidth / scale;
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
    drawMidEllipses(points) {
        const { scale } = this.leafer;
        const width = this.ellipseWidth / scale;
        const strokeWidth = this.strokeWidth / scale;
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
                visible: showMidEllipses(linePoints, index),
            });
            this.midEllipses.push(ellipse);
            this.addMidEvents(ellipse, index);
        });
        this.add(this.midEllipses);
    }
    addRectEvents(rect) {
        rect.on(PointerEvent.DOWN, (e) => {
            const { x: originX, y: originY } = this.selectItem;
            const { x: startX, y: startY } = e.getPagePoint();
            const appMoveEventId = this.app.on_(PointerEvent.MOVE, (e) => {
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
    addEdgeEvents(ellipse, index) {
        ellipse.on(PointerEvent.DOWN, (e) => {
            const { x: originX, y: originY } = ellipse;
            const startPoint = e.getPagePoint();
            const originPoint = {
                x: originX,
                y: originY,
            };
            const memoryInfo = {
                side: null,
                spaced: null,
            };
            const appMoveEventId = this.app.on_(PointerEvent.MOVE, (e) => {
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
    addMidEvents(ellipse, index) {
        ellipse.on(PointerEvent.DOWN, (e) => {
            const { x: originX, y: originY } = ellipse;
            const startPoint = e.getPagePoint();
            const originPoint = {
                x: originX,
                y: originY,
            };
            const memoryInfo = {
                index,
                pre: null,
                next: null,
            };
            const appMoveEventId = this.app.on_(PointerEvent.MOVE, (e) => {
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
        });
    }
    handleEdgeMove(originPoint, startPoint, point, index, memoryInfo) {
        const { x, y } = point;
        const { points } = this.selectItem;
        const { x: originX, y: originY } = originPoint;
        const { x: startX, y: startY } = startPoint;
        const length = points.length;
        const isFirst = index === 0;
        const realPoint = {
            x: originX + x - startX,
            y: originY + y - startY,
        };
        if (length === 2) {
            this.handleTwoPoints(isFirst, realPoint, points, memoryInfo);
        }
        else {
            this.handleMultiPoints(isFirst, realPoint, points, memoryInfo);
        }
    }
    handleTwoPoints(isFirst, realPoint, points, memoryInfo) {
        const isHori = isHorizon(points[0], points[1]);
        const sidePoint = isFirst ? points[1] : points[0];
        const xy = isHori ? 'x' : 'y';
        const yx = isHori ? 'y' : 'x';
        const uIndex = isFirst ? 0 : points.length - 1;
        const distance = Math.abs(realPoint[yx] - sidePoint[yx]);
        const oppoDistance = Math.abs(realPoint[xy] - sidePoint[xy]);
        const newPoints = [];
        const updPoints = [];
        if (oppoDistance < EDITOR_DEFAULT_ADJUST_DISTANCE)
            return;
        if (distance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
            updPoints.push({
                index: uIndex,
                x: isHori ? realPoint.x : sidePoint.x,
                y: isHori ? sidePoint.y : realPoint.y,
            });
        }
        else {
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
            }
            else {
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
    handleMultiPoints(isFirst, realPoint, points, memoryInfo) {
        const { side, spaced } = memoryInfo;
        const length = points.length;
        const curPoint = isFirst ? points[0] : points.at(-1);
        const sidePoint = isFirst ? points[1] : points.at(-2);
        const spacedPoint = isFirst ? points[2] : points.at(-3);
        const spacedTwoPoint = isFirst ? points[3] : points.at(-4);
        const isHori = isHorizon(curPoint, sidePoint);
        const uIndex = isFirst ? 0 : length - 1;
        const hIndex = isFirst ? 1 : length - 2;
        const xy = isHori ? 'x' : 'y';
        const yx = isHori ? 'y' : 'x';
        const distance = Math.abs(realPoint[yx] - sidePoint[yx]);
        const oppoDistance = Math.abs(realPoint[xy] - sidePoint[xy]);
        const spacedDistance = Math.abs(realPoint[yx] - spacedPoint[yx]);
        const oppoSpacedDistance = Math.abs(realPoint[xy] - spacedPoint[xy]);
        const newPoints = [];
        const updPoints = [];
        let delInfo = null;
        if (spacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE && oppoSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
            return;
        }
        if (spacedTwoPoint) {
            const spacedTwoDistance = Math.abs(realPoint[yx] - spacedTwoPoint[yx]);
            const oppoSpacedTwoDistance = Math.abs(realPoint[xy] - spacedTwoPoint[xy]);
            if (spacedTwoDistance < EDITOR_DEFAULT_ADJUST_DISTANCE && oppoSpacedTwoDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
                return;
            }
        }
        if (side || spaced) {
            if (oppoDistance < EDITOR_DEFAULT_ADJUST_DISTANCE)
                return;
            if (distance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
                updPoints.push({
                    index: uIndex,
                    x: isHori ? realPoint.x : sidePoint.x,
                    y: isHori ? sidePoint.y : realPoint.y,
                });
            }
            else {
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
                }
                else {
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
        }
        else {
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
            }
            else if (spacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
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
            }
            else {
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
    handleMidMove(originPoint, startPoint, point, memoryInfo) {
        const { x, y } = point;
        const points = this.selectItem.points;
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
        }
        else {
            this.handleOtherLine(realPoint, points, memoryInfo);
        }
    }
    handleEdgeLine(realPoint, points, memoryInfo) {
        const { pre, next, index } = memoryInfo;
        const tempMemory = Object.assign({}, memoryInfo);
        const length = points.length;
        const prePoint = length === 2 || index === 0 ? points[0] : points[length - 2];
        const nextPoint = length === 2 || index === 0 ? points[1] : points[length - 1];
        const isHori = isHorizon(prePoint, nextPoint);
        const yx = isHori ? 'y' : 'x';
        const preDistance = Math.abs(realPoint[yx] - prePoint[yx]);
        const nextDistance = Math.abs(realPoint[yx] - nextPoint[yx]);
        const newPoints = [];
        const updPoints = [];
        if (preDistance < EDITOR_DEFAULT_ADJUST_DISTANCE || nextDistance < EDITOR_DEFAULT_ADJUST_DISTANCE)
            return;
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
        }
        else {
            if (index === 0) {
                tempMemory.index += 1;
                newPoints.push({
                    x: isHori ? prePoint.x : realPoint.x,
                    y: isHori ? realPoint.y : prePoint.y,
                });
            }
            else {
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
        }
        else {
            if (index === length - 2) {
                newPoints.push({
                    x: isHori ? nextPoint.x : realPoint.x,
                    y: isHori ? realPoint.y : nextPoint.y,
                });
            }
            else {
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
    handleOtherLine(realPoint, points, memoryInfo) {
        const { pre, next, index } = memoryInfo;
        const tempMemory = Object.assign({}, memoryInfo);
        const length = points.length;
        const preSpaced = points[index - 1];
        const prePoint = points[index];
        const nextPoint = points[index + 1];
        const nextSpaced = points[index + 2];
        const isHori = isHorizon(prePoint, nextPoint);
        const xy = isHori ? 'x' : 'y';
        const yx = isHori ? 'y' : 'x';
        const preSpacedDistance = Math.abs(realPoint[yx] - preSpaced[yx]);
        const nextSpacedDistance = Math.abs(realPoint[yx] - nextSpaced[yx]);
        const newPoints = [];
        const updPoints = [];
        const delInfo = {
            preCount: 0,
            nextCount: 0,
        };
        if (pre) {
            const preDistance = Math.abs(realPoint[yx] - prePoint[yx]);
            if (nextSpacedDistance >= EDITOR_DEFAULT_ADJUST_DISTANCE && preDistance < EDITOR_DEFAULT_ADJUST_DISTANCE)
                return;
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
        }
        else {
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
            }
            else if (nextSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
                if (points[index + 3]) {
                    const jumpDistance = Math.abs(points[index + 3][xy] - prePoint[xy]);
                    if (jumpDistance < EDITOR_DEFAULT_ADJUST_DISTANCE)
                        return;
                }
                updPoints.push({
                    index,
                    x: isHori ? prePoint.x : nextSpaced.x,
                    y: isHori ? nextSpaced.y : prePoint.y,
                });
            }
            else {
                updPoints.push({
                    index,
                    x: isHori ? prePoint.x : realPoint.x,
                    y: isHori ? realPoint.y : prePoint.y,
                });
            }
        }
        if (next) {
            const nextDistance = Math.abs(realPoint[yx] - nextPoint[yx]);
            if (preSpacedDistance >= EDITOR_DEFAULT_ADJUST_DISTANCE && nextDistance < EDITOR_DEFAULT_ADJUST_DISTANCE)
                return;
            const tempPoint = preSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE ? preSpaced : realPoint;
            tempMemory.next = null;
            newPoints.push({
                x: isHori ? next.x : tempPoint.x,
                y: isHori ? tempPoint.y : next.y,
            }, {
                x: isHori ? next.x : nextPoint.x,
                y: isHori ? nextPoint.y : next.y,
            });
        }
        else {
            if (nextSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE && nextSpacedDistance <= preSpacedDistance) {
                const count = index === length - 3 ? 1 : 2;
                delInfo.nextCount = count;
                if (index !== length - 3) {
                    tempMemory.next = {
                        x: isHori ? nextPoint.x : realPoint.x,
                        y: isHori ? realPoint.y : nextPoint.y,
                    };
                }
            }
            else if (preSpacedDistance < EDITOR_DEFAULT_ADJUST_DISTANCE) {
                if (points[index - 2]) {
                    const jumpDistance = Math.abs(points[index - 2][xy] - nextPoint[xy]);
                    if (jumpDistance < EDITOR_DEFAULT_ADJUST_DISTANCE)
                        return;
                }
                updPoints.push({
                    index: index + 1,
                    x: isHori ? nextPoint.x : preSpaced.x,
                    y: isHori ? preSpaced.y : nextPoint.y,
                });
            }
            else {
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
            if (delIndex >= index + 1) {
                delIndex += newPoints.length;
            }
            removePoints(this.selectItem, delIndex, delCount);
            removePoints(this.line, delIndex, delCount);
        }
    }
    redrawEllipses() {
        const { points } = this.selectItem;
        const midPoints = getMidPoints(points);
        this.drawEdgeEllipses(points);
        this.drawMidEllipses(midPoints);
    }
    removeEllipses() {
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
__decorate([
    sortType(EDITOR_DEFAULT_Z_INDEX)
], OrthoPolylineEditor.prototype, "zIndex", void 0);

export { FreePolyline, FreePolylineEditor, OrthoPolyline, OrthoPolylineEditor };
