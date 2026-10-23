import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux/store.jsx';
import App from './App.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css'; // Import Animate.css
ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
);