import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {Navigate, RouterProvider, createHashRouter} from 'react-router-dom';
import {CountingGame} from './counting-game/counting-game';
import './index.css';
import {LetterGame} from './letter-game/letter-game';

const router = createHashRouter([
  {
    path: '/',
    element: <Navigate to="/counting-game" />,
  },
  {
    path: '/counting-game',
    element: <CountingGame />,
  },
  {
    path: '/letter-game',
    element: <LetterGame />,
  },
  {
    path: '*',
    element: <Navigate to="/" />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
