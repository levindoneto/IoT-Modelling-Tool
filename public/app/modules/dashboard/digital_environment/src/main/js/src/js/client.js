import React from 'react';
import ReactDOM from 'react-dom';
import DragAroundNaive from './components/DragAroundNaive';
import injectTapEventPlugin from 'react-tap-event-plugin';


const rootEl = document.getElementById('root');
window.boxes = []

injectTapEventPlugin();
ReactDOM.render(
 <DragAroundNaive />,
 rootEl
);
