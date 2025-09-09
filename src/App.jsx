import { NavMenu } from "@shopify/app-bridge-react";
import { BrowserRouter, Link } from "react-router-dom";
import Routes from "./routes";
import { PolarisProvider } from "./components/provider/PolarisProvider";
import { Provider } from "react-redux";
import store from "./redux/store";

function App() {
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  return (
    <>
      <BrowserRouter>
        <Provider store={store}>
          <PolarisProvider>
            <>
              <NavMenu>
                <Link to={`/dashboard${window.location.search}`} rel="home">
                  dashboard
                </Link>
                <Link to={`/loyaltyProgram${window.location.search}`}>loyaltyProgram</Link>
                <Link to={`/customer${window.location.search}`}>
                  customer
                </Link>
                <Link to={`/settings${window.location.search}`}>settings</Link>
              </NavMenu>
            </>
            <Routes pages={pages} />
          </PolarisProvider>
        </Provider>
      </BrowserRouter>
    </>
  );
}

export default App;