import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./Home";
import Call from "./Call";
import Chat from "./Chat";

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={() => <Home />}></Route>
          {/* <Route exact path="/:roomId" component={() => <Chat />}></Route> */}
          <Route exact path="/:roomId" component={() => <Call />}></Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
