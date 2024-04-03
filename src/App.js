import {Routes, Route} from 'react-router-dom';
import Lobby from './screens/Lobby';
import Room from './screens/Room';

function App() {
  return <div className="App bg-gray-800">
    <Routes>
      <Route path='/' element = {<Lobby/>}/>
      <Route path='/room/:roomId' element = {<Room/>}/>
    </Routes>
  </div>;
}

export default App;
