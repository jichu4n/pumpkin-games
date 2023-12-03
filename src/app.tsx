import 'bootstrap/dist/css/bootstrap.min.css';
import {PumpkinRows} from './pumpkin-rows';

function App() {
  return (
    <>
      <div className="d-flex align-items-center h-100">
        <PumpkinRows count={27} />
      </div>
    </>
  );
}

export default App;
