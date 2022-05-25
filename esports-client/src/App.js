import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css';
import { MongoDBSection } from './components/mongodb/MongoDBSection';
import { PostgresSection } from './components/postgres/PostgresSection';

const App = () => {

  return (
    <div className="App">
      <header>
        <NavLink className={({ isActive }) => 'postgres nav-link' + (isActive ? ' nav-active' : '')} to={'postgres'}>Postgres</NavLink>
        <NavLink className={({ isActive }) => 'mongodb nav-link' + (isActive ? ' nav-active' : '')} to={'mongodb'}>MongoDB</NavLink>
      </header>
      <Routes>
        <Route path='postgres/*' element={<PostgresSection />} />
        <Route path='mongodb/*' element={<MongoDBSection />} />
      </Routes>
    </div>
  );
}

export default App;
