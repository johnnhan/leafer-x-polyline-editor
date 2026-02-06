this.LeaferX = this.LeaferX || {};
this.LeaferX.PolylineEditor = (function (exports, arrow, core) {
    'use strict';

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

    let PolylineData$1 = class PolylineData extends arrow.ArrowData {
    };

    function isFreeLine(points) {
        return points.length >= 2;
    }
    function isOrthoLine(points) {
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
    function updateSelectItemPoints(line, points) {
        const newPoints = points.map((point) => line.getInnerPoint(point));
        line.setAttr('points', newPoints);
    }

    const POLYLINE_DEFAULT_STROKE_CAP = 'round';
    const POLYLINE_DEFAULT_STROKE_JOIN = 'round';
    const POLYLINE_DEFAULT_START_ARROW = 'none';
    const POLYLINE_DEFAULT_END_ARROW = 'none';
    const EDITOR_DEFAULT_COLOR = '#1890FF';
    const EDITOR_DEFAULT_STROKE_WIDTH = 2;
    const EDITOR_DEFAULT_ELLIPSE_WIDTH = 10;
    const EDITOR_DEFAULT_ADJUST_DISTANCE = 10;
    const POLYLINE_DEFAULT_EDIT_CONFIG = {
        moveable: true,
    };

    exports.FreePolyline = class FreePolyline extends arrow.Arrow {
        get __tag() {
            return 'FreePolyline';
        }
        constructor(data) {
            super(data);
            if (!isFreeLine(this.points)) {
                const jsonData = JSON.stringify(data);
                const errorMsg = `Params points can't paint an orthogonal polylines!\n${jsonData}`;
                throw new Error(errorMsg);
            }
        }
    };
    __decorate([
        core.dataProcessor(PolylineData$1)
    ], exports.FreePolyline.prototype, "__", void 0);
    __decorate([
        core.boundsType(POLYLINE_DEFAULT_STROKE_CAP)
    ], exports.FreePolyline.prototype, "strokeCap", void 0);
    __decorate([
        core.boundsType(POLYLINE_DEFAULT_STROKE_JOIN)
    ], exports.FreePolyline.prototype, "strokeJoin", void 0);
    __decorate([
        core.boundsType(POLYLINE_DEFAULT_START_ARROW)
    ], exports.FreePolyline.prototype, "startArrow", void 0);
    __decorate([
        core.boundsType(POLYLINE_DEFAULT_END_ARROW)
    ], exports.FreePolyline.prototype, "endArrow", void 0);
    __decorate([
        core.createAttr(POLYLINE_DEFAULT_EDIT_CONFIG)
    ], exports.FreePolyline.prototype, "editConfig", void 0);
    exports.FreePolyline = __decorate([
        core.registerUI()
    ], exports.FreePolyline);

    class PolylineData extends arrow.ArrowData {
        set editConfig(value) {
            this._editConfig = Object.assign(Object.assign({}, POLYLINE_DEFAULT_EDIT_CONFIG), value);
        }
    }

    exports.OrthoPolyline = class OrthoPolyline extends arrow.Arrow {
        get __tag() {
            return 'OrthoPolyline';
        }
        constructor(data) {
            super(data);
            if (!isOrthoLine(this.points)) {
                const jsonData = JSON.stringify(data);
                const errorMsg = `Params points can't paint an orthogonal polylines!\n${jsonData}`;
                throw new Error(errorMsg);
            }
        }
        setStart(point) {
            const { points } = this;
            const newPoints = [...points];
            const curPoint = newPoints[0];
            const sidePoint = newPoints[1];
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
            }
            else {
                const spacePoint = newPoints[2];
                curPoint.x = point.x === spacePoint.x ? point.x + 1e-6 : point.x;
                curPoint.y = point.y === spacePoint.y ? point.y + 1e-6 : point.y;
                newPoints[1] = {
                    x: h ? sidePoint.x : curPoint.x,
                    y: h ? curPoint.y : sidePoint.y,
                };
            }
            this.setAttr('points', newPoints);
        }
        setEnd(point) {
            const { points } = this;
            const newPoints = [...points];
            const curPoint = newPoints.at(-1);
            const sidePoint = newPoints.at(-2);
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
            }
            else {
                const spacePoint = newPoints.at(-3);
                curPoint.x = point.x === spacePoint.x ? point.x + 1e-6 : point.x;
                curPoint.y = point.y === spacePoint.y ? point.y + 1e-6 : point.y;
                newPoints[newPoints.length - 2] = {
                    x: h ? sidePoint.x : curPoint.x,
                    y: h ? curPoint.y : sidePoint.y,
                };
            }
            this.setAttr('points', newPoints);
        }
    };
    __decorate([
        core.dataProcessor(PolylineData)
    ], exports.OrthoPolyline.prototype, "__", void 0);
    __decorate([
        core.strokeType(POLYLINE_DEFAULT_STROKE_CAP)
    ], exports.OrthoPolyline.prototype, "strokeCap", void 0);
    __decorate([
        core.strokeType(POLYLINE_DEFAULT_STROKE_JOIN)
    ], exports.OrthoPolyline.prototype, "strokeJoin", void 0);
    __decorate([
        arrow.arrowType(POLYLINE_DEFAULT_START_ARROW)
    ], exports.OrthoPolyline.prototype, "startArrow", void 0);
    __decorate([
        arrow.arrowType(POLYLINE_DEFAULT_END_ARROW)
    ], exports.OrthoPolyline.prototype, "endArrow", void 0);
    __decorate([
        core.dataType(POLYLINE_DEFAULT_EDIT_CONFIG)
    ], exports.OrthoPolyline.prototype, "editConfig", void 0);
    exports.OrthoPolyline = __decorate([
        core.registerUI()
    ], exports.OrthoPolyline);

    class PolylineEditorData extends core.GroupData {
    }

    function showMidEllipses$1(points, index) {
        const prePoint = points[index];
        const nextPoint = points[index + 1];
        const isHori = isHorizon(prePoint, nextPoint);
        return isHori
            ? Math.abs(prePoint.x - nextPoint.x) >= EDITOR_DEFAULT_ADJUST_DISTANCE * 2
            : Math.abs(prePoint.y - nextPoint.y) >= EDITOR_DEFAULT_ADJUST_DISTANCE * 2;
    }
    function handleEdgeMove$1(point, memoryInfo, handleLine, targetLine) {
        const { points } = handleLine;
        const length = points.length;
        if (length === 2) {
            handleTwoPoints(point, points, memoryInfo, handleLine, targetLine);
        }
        else {
            handleMultiPoints(point, points, memoryInfo, handleLine, targetLine);
        }
    }
    function handleMidMove$1(point, memoryInfo, handleLine, targetLine) {
        const { points } = handleLine;
        const length = points.length;
        const { index } = memoryInfo;
        if (index === 0 || index === length - 2) {
            handleEdgeLine(point, points, memoryInfo, handleLine, targetLine);
        }
        else {
            handleOtherLine(point, points, memoryInfo, handleLine, targetLine);
        }
    }
    function handleTwoPoints(realPoint, points, memoryInfo, handleLine, targetLine) {
        const { index, side, spaced, length } = memoryInfo;
        const isFirst = index === 0;
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
                isFirst
                    ? (length === 3 ? newPoints.push(pointA) : newPoints.push(pointA, pointB))
                    : (length === 3 ? newPoints.push(pointA) : newPoints.push(pointB, pointA));
            }
        }
        if (updPoints.length) {
            updatePoints(handleLine, updPoints);
            updateSelectItemPoints(targetLine, handleLine.points);
        }
        if (newPoints.length) {
            addPoints(handleLine, newPoints, 1);
            updateSelectItemPoints(targetLine, handleLine.points);
        }
    }
    function handleMultiPoints(realPoint, points, memoryInfo, handleLine, targetLine) {
        const { index, side, spaced } = memoryInfo;
        const isFirst = index === 0;
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
                memoryInfo.length = length;
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
            updatePoints(handleLine, updPoints);
            updateSelectItemPoints(targetLine, handleLine.points);
        }
        if (newPoints.length) {
            const addIndex = isFirst ? 1 : length - 1;
            addPoints(handleLine, newPoints, addIndex);
            updateSelectItemPoints(targetLine, handleLine.points);
        }
        if (delInfo) {
            const { index, count } = delInfo;
            removePoints(targetLine, index, count);
            removePoints(handleLine, index, count);
        }
    }
    function handleEdgeLine(realPoint, points, memoryInfo, handleLine, targetLine) {
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
            updatePoints(handleLine, updPoints);
            updateSelectItemPoints(targetLine, handleLine.points);
        }
        if (newPoints.length) {
            const aIndex = index === 0 ? 1 : length - 1;
            addPoints(handleLine, newPoints, aIndex);
            updateSelectItemPoints(targetLine, handleLine.points);
        }
    }
    function handleOtherLine(realPoint, points, memoryInfo, handleLine, targetLine) {
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
            updatePoints(handleLine, updPoints);
            updateSelectItemPoints(targetLine, handleLine.points);
        }
        if (newPoints.length) {
            addPoints(handleLine, newPoints, index + 1);
            updateSelectItemPoints(targetLine, handleLine.points);
        }
        if (delInfo.preCount || delInfo.nextCount) {
            const { preCount, nextCount } = delInfo;
            const delCount = preCount + nextCount;
            let delIndex = preCount ? (index - 1 || 1) : index + 1;
            if (delIndex >= index + 1) {
                delIndex += newPoints.length;
            }
            removePoints(targetLine, delIndex, delCount);
            removePoints(handleLine, delIndex, delCount);
        }
    }

    function showMidEllipses(points, index) {
        const prePoint = points[index];
        const nextPoint = points[index + 1];
        return Math.abs(prePoint.x - nextPoint.x) >= EDITOR_DEFAULT_ADJUST_DISTANCE * 2 || Math.abs(prePoint.y - nextPoint.y) >= EDITOR_DEFAULT_ADJUST_DISTANCE * 2;
    }
    function handleEdgeMove(point, memoryInfo, handleLine, targetLine) {
        const { index } = memoryInfo;
        const updPoints = [{
                index,
                x: point.x,
                y: point.y,
            }];
        updatePoints(handleLine, updPoints);
        updateSelectItemPoints(targetLine, handleLine.points);
    }
    function handleMidMove(point, memoryInfo, handleLine, targetLine) {
        const { length, index } = memoryInfo;
        const newPoint = {
            x: point.x,
            y: point.y,
        };
        const updPoint = Object.assign(Object.assign({}, newPoint), { index: index + 1 });
        if (length === handleLine.points.length) {
            addPoints(handleLine, [newPoint], index + 1);
            updateSelectItemPoints(targetLine, handleLine.points);
        }
        else {
            updatePoints(handleLine, [updPoint]);
            updateSelectItemPoints(targetLine, handleLine.points);
        }
    }

    class PolylineEditor extends core.Group {
        constructor(config) {
            super(config);
            this.line = null;
            this.selectItem = null;
            this.edgeEllipses = [];
            this.midEllipses = [];
            this.initEvents();
        }
        get __tag() {
            return 'PolylineEditor';
        }
        initEvents() {
            this.waitLeafer(() => {
                const { isApp, sky } = this.app;
                if (isApp && this.parent === sky) {
                    this.app.on(core.PointerEvent.DOWN, this.downHandler.bind(this));
                    this.app.on(core.PointerEvent.DOUBLE_TAP, this.doubleTapHandler.bind(this));
                    this.app.on(core.ZoomEvent.ZOOM, this.redrawEditor.bind(this));
                    this.app.on(core.MoveEvent.MOVE, this.redrawEditor.bind(this));
                }
                else {
                    throw new Error('PolylineEditor must be added to the zoomLayer of the App!');
                }
            });
        }
        downHandler(e) {
            if (this.app.mode !== 'normal')
                return;
            if (![1, 2].includes(e.buttons))
                return;
            const target = e.target;
            if (target.parent === this)
                return;
            this.select(target);
        }
        doubleTapHandler(e) {
            if (this.app.mode !== 'normal')
                return;
            if (!this.selectItem)
                return;
            const target = e.target;
            if (target.parent === this)
                return;
            this.emit('double-tap', { target: this.selectItem });
        }
        drawEditor() {
            const { points, editConfig } = this.selectItem;
            const { moveable } = editConfig;
            const edgePoints = points.map((point) => this.selectItem.getWorldPoint(point));
            this.drawLine(edgePoints);
            if (moveable) {
                const midPoints = getMidPoints(edgePoints);
                this.drawEdgeEllipses(edgePoints);
                this.drawMidEllipses(midPoints);
            }
        }
        clearEditor() {
            this.edgeEllipses.forEach(ellipse => {
                ellipse.off(core.DragEvent.DRAG);
                ellipse.off(core.DragEvent.END);
                ellipse.destroy();
            });
            this.midEllipses.forEach(ellipse => {
                ellipse.off(core.DragEvent.DRAG);
                ellipse.off(core.DragEvent.END);
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
        drawLine(points) {
            const { color, strokeWidth, } = this;
            this.line = new core.Line({
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
        drawEdgeEllipses(points) {
            const { tag } = this.selectItem;
            const finalPoints = tag === 'FreePolyline' ? points : [points[0], points.at(-1)];
            const { color, ellipseWidth, strokeWidth, } = this;
            finalPoints.forEach((point, index) => {
                const ellipse = new core.Ellipse({
                    width: ellipseWidth,
                    height: ellipseWidth,
                    x: point.x,
                    y: point.y,
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
        drawMidEllipses(points) {
            const { tag } = this.selectItem;
            const linePoints = this.line.points;
            const { color, ellipseWidth, strokeWidth, } = this;
            points.forEach((point, index) => {
                const ellipse = new core.Ellipse({
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
                        ? showMidEllipses$1(linePoints, index)
                        : showMidEllipses(linePoints, index),
                });
                this.midEllipses.push(ellipse);
                this.addMidEvents(ellipse, index);
            });
            this.add(this.midEllipses);
        }
        addEdgeEvents(ellipse, index) {
            const { tag } = this.selectItem;
            const length = this.line.points.length;
            const memoryInfo = {
                length,
                index,
                side: null,
                spaced: null,
            };
            ellipse.on(core.DragEvent.START, (e) => {
                this.hideEllipses();
                this.emit('drag-start', {
                    target: this.selectItem,
                    current: ellipse,
                });
            });
            ellipse.on(core.DragEvent.DRAG, (e) => {
                const { x, y } = ellipse;
                const point = { x, y };
                if (tag === 'OrthoPolyline') {
                    handleEdgeMove$1(point, memoryInfo, this.line, this.selectItem);
                }
                else if (tag === 'FreePolyline') {
                    handleEdgeMove(point, memoryInfo, this.line, this.selectItem);
                }
                this.emit('drag', {
                    target: this.selectItem,
                    current: ellipse,
                });
            });
            ellipse.on(core.DragEvent.END, (e) => {
                ellipse.off(core.DragEvent.DRAG);
                ellipse.off(core.DragEvent.END);
                this.redrawEditor();
                this.emit('drag-end', {
                    target: this.selectItem,
                    current: ellipse,
                });
            });
        }
        addMidEvents(ellipse, index) {
            const { tag } = this.selectItem;
            const length = this.line.points.length;
            const memoryInfo = {
                length,
                index,
                pre: null,
                next: null,
            };
            ellipse.on(core.DragEvent.START, (e) => {
                this.hideEllipses();
                this.emit('drag-start', {
                    target: this.selectItem,
                    current: ellipse,
                });
            });
            ellipse.on(core.DragEvent.DRAG, (e) => {
                const { x, y } = ellipse;
                const point = { x, y };
                if (tag === 'OrthoPolyline') {
                    handleMidMove$1(point, memoryInfo, this.line, this.selectItem);
                }
                else if (tag === 'FreePolyline') {
                    handleMidMove(point, memoryInfo, this.line, this.selectItem);
                }
                this.emit('drag', {
                    target: this.selectItem,
                    current: ellipse,
                });
            });
            ellipse.on(core.DragEvent.END, (e) => {
                ellipse.off(core.DragEvent.DRAG);
                ellipse.off(core.DragEvent.END);
                this.redrawEditor();
                this.emit('drag-end', {
                    target: this.selectItem,
                    current: ellipse,
                });
            });
        }
        redrawEditor() {
            if (this.selectItem) {
                this.clearEditor();
                this.drawEditor();
            }
        }
        hideEllipses() {
            this.edgeEllipses.forEach(ellipse => {
                ellipse.setAttr('visible', false);
            });
            this.midEllipses.forEach(ellipse => {
                ellipse.setAttr('visible', false);
            });
        }
        select(line) {
            if (line === this.selectItem)
                return;
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
        cancel() {
            this.clearEditor();
            this.emit('select', {
                oldValue: this.selectItem,
                value: null,
            });
        }
    }
    __decorate([
        core.dataProcessor(PolylineEditorData)
    ], PolylineEditor.prototype, "__", void 0);
    __decorate([
        core.createAttr(EDITOR_DEFAULT_COLOR)
    ], PolylineEditor.prototype, "color", void 0);
    __decorate([
        core.createAttr(EDITOR_DEFAULT_STROKE_WIDTH)
    ], PolylineEditor.prototype, "strokeWidth", void 0);
    __decorate([
        core.createAttr(EDITOR_DEFAULT_ELLIPSE_WIDTH)
    ], PolylineEditor.prototype, "ellipseWidth", void 0);

    exports.PolylineEditor = PolylineEditor;
    exports.isFreeLine = isFreeLine;
    exports.isHorizon = isHorizon;
    exports.isOrthoLine = isOrthoLine;
    exports.isVertical = isVertical;

    return exports;

})({}, LeaferIN.arrow, LeaferUI);
