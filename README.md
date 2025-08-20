# 【插件】leafer-x-polyline-editor 折线编辑插件

基于 Leafer 开发的折线编辑插件，可以通过拖拽节点来修改或者增加、减少线段等。支持的折线包括自由折线、正交折线。

## 插件安装

```bash
npm install leafer-x-polyline-editor
```

## 在线体验

[自由折线](https://canvas.johnhan.fun/freePolyline)
[正交折线](https://canvas.johnhan.fun/orthoPolyline)

## 插件使用

### 自由折线

#### 使用方法

```js
import '@leafer-in/viewport';
import { FreePolyline, FreePolylineEditor } from 'jd-canvas';
import { App } from 'leafer-ui';

const app = new App({
  view: window,
  type: 'custom',
  tree: {},
  sky: {},
});

const element = new FreePolyline({
  points: [
    { x: 100, y: 20 },
    { x: 200, y: 100 },
    { x: 100, y: 180 },
  ],
  stroke: '#ff9999',
  strokeWidth: 8,
});

const editor = new FreePolylineEditor();

app.sky.add(editor);
app.tree.add(element);
```

#### 参数

FreePolyline

| 参数 | 类型 | 默认值 | 说明 |
| -- | -- | -- | -- |
| 继承自 Arrow | [IArrowInputData](https://www.leaferjs.com/ui/api/interfaces/IArrowInputData.html) | \- | [Leafer Arrow](https://www.leaferjs.com/ui/plugin/in/arrow/) |

FreePolylineEditor

| 参数 | 类型 | 默认值 | 说明 |
| -- | -- | -- | -- |
| color | string | #1890FF | 编辑器颜色 |
| strokeWidth | number | 2 | 编辑器线宽 |
| ellipseWidth | number | 10 | 编辑器控制点大小 |

### 正交折线

#### 使用方法

```js
import '@leafer-in/viewport';
import { OrthoPolyline, OrthoPolylineEditor } from 'jd-canvas';
import { App } from 'leafer-ui';

const app = new App({
  view: window,
  type: 'custom',
  tree: {},
  sky: {},
});

const element = new OrthoPolyline({
  points: [
    { x: 100, y: 20 }, 
    { x: 200, y: 20 }, 
    { x: 200, y: 180 }, 
    { x: 300, y: 180 },
  ],
  stroke: '#ff9999',
  strokeWidth: 8,
});

const editor = new OrthoPolylineEditor();

app.sky.add(editor);
app.tree.add(element);
```

#### 参数

OrthoPolyline

| 参数 | 类型 | 默认值 | 说明 |
| -- | -- | -- | -- |
| 继承自 Arrow | [IArrowInputData](https://www.leaferjs.com/ui/api/interfaces/IArrowInputData.html) | \- | [Leafer Arrow](https://www.leaferjs.com/ui/plugin/in/arrow/) |

OrthoPolylineEditor

| 参数 | 类型 | 默认值 | 说明 |
| -- | -- | -- | -- |
| color | string | #1890FF | 编辑器颜色 |
| strokeWidth | number | 2 | 编辑器线宽 |
| ellipseWidth | number | 10 | 编辑器控制点大小 |
