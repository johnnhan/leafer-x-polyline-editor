# 【插件】leafer-x-polyline-editor

基于 Leafer 开发的折线编辑插件，可以通过拖拽节点来修改或者增加、减少线段等。支持的折线包括自由折线、正交折线。

## 插件安装

```bash
npm install leafer-x-polyline-editor
```

## 在线体验

[自由折线](https://canvas.johnhan.fun/freePolyline)
[正交折线](https://canvas.johnhan.fun/orthoPolyline)

## 插件使用

### 折线编辑器（PolylineEditor）

#### 参数

| 参数 | 类型 | 默认值 | 说明 |
| -- | -- | -- | -- |
| color | string | #1890FF | 编辑器颜色 |
| strokeWidth | number | 2 | 编辑器线宽 |
| ellipseWidth | number | 10 | 编辑器控制点大小 |

#### 事件

| 事件 | 参数 | 说明 |
| -- | -- | -- |
| double-tap | { target } | 双击折线事件 |
| drag-start | { target, current } | 拖拽折线开始事件 |
| drag | { target, current } | 拖拽折线事件 |
| drag-end | { target, current } | 拖拽折线结束事件 |
| line-select | { oldValue, value } | 折线选中事件 |

#### 示例

```js
const editor = new PolylineEditor({
  color: '#ff9999',
});

editor.on('drag', ({ target, current }) => {
  console.log(target, current);
});
```

### 自由折线（FreePolyline）

插件暂未适配官方编辑器，如果使用了官方编辑器，请保证 FreePolyline 实例的 editable 属性值为 false

#### 使用方法

#### 参数

| 参数 | 类型 | 默认值 | 说明 |
| -- | -- | -- | -- |
| 继承自 Arrow | [IArrowInputData](https://www.leaferjs.com/ui/api/interfaces/IArrowInputData.html) | \- | [Leafer Arrow](https://www.leaferjs.com/ui/plugin/in/arrow/) |

#### 示例

```js
import '@leafer-in/viewport';
import { FreePolyline, PolylineEditor } from 'leafer-x-polyline-editor';
import { App } from 'leafer-ui';

const app = new App({
  view: window,
  type: 'viewport',
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

const editor = new PolylineEditor();

app.sky.add(editor);
app.tree.add(element);
```

### 正交折线（OrthoPolyline）

插件暂未适配官方编辑器，如果使用了官方编辑器，请保证 OrthoPolyline 实例的 editable 属性值为 false

#### 参数

| 参数 | 类型 | 默认值 | 说明 |
| -- | -- | -- | -- |
| 继承自 Arrow | [IArrowInputData](https://www.leaferjs.com/ui/api/interfaces/IArrowInputData.html) | \- | [Leafer Arrow](https://www.leaferjs.com/ui/plugin/in/arrow/) |

#### 方法

| 方法 | 参数 | 说明 |
| -- | -- | -- |
| setStart | point：内部坐标系坐标 | 设置正交折线起点，保证点位不重复 |
| setEnd | point：内部坐标系坐标 | 设置正交折线终点，保证点位不重复 |

#### 示例

```js
import '@leafer-in/viewport';
import { OrthoPolyline, PolylineEditor } from 'leafer-x-polyline-editor';
import { App } from 'leafer-ui';

const app = new App({
  view: window,
  type: 'viewport',
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

const editor = new PolylineEditor();

app.sky.add(editor);
app.tree.add(element);

setTimeout(() => {
  element.setStart({ x: 120, y: 20 });
}, 2000);
```
