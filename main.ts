import '@leafer-in/viewport';
import { 
  App,
} from 'leafer-ui';
import {
  FreePolyline,
  OrthoPolyline,
  FreePolylineEditor,
  OrthoPolylineEditor,
} from './src';

const app = new App({
  view: window,
  type: 'viewport',
  wheel: {
    zoomMode: true,
    delta: {
      x: 20,
      y: 150,
    },
  },
  move: {
    holdMiddleKey: true,
  },
  tree: {},
});

const freePolyline = new FreePolyline({
  points: [
    { x: 100, y: 100 },
    { x: 200, y: 200 },
    { x: 100, y: 300 },
  ],
  zIndex: 0,
  stroke: '#000',
  strokeWidth: 8,
});

const orthoPolyline = new OrthoPolyline({
  points: [
    { x: 400, y: 300 },
    { x: 600, y: 300 },
    { x: 600, y: 500 },
    { x: 800, y: 500 },
  ],
  zIndex: 0,
  stroke: '#000',
  strokeWidth: 8,
});

const polylineEditor = new FreePolylineEditor();
const orthoPolylineEditor = new OrthoPolylineEditor();

app.tree.add(polylineEditor);
app.tree.add(orthoPolylineEditor);
app.tree.add(freePolyline);
app.tree.add(orthoPolyline);
