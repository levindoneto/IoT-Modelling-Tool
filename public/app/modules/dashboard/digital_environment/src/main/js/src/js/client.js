import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import DragAroundNaive from './components/DragAroundNaive';

const rootEl = document.getElementById('root');
window.boxes = [];

injectTapEventPlugin();
ReactDOM.render(
 <DragAroundNaive />,
 rootEl
);
