import { NavMenu } from "@shopify/app-bridge-react";
import { BrowserRouter, Link, useLocation } from "react-router-dom";
import Routes from "./routes";
import { PolarisProvider } from "./components/provider/PolarisProvider";
import { Provider } from "react-redux";
import store from "./redux/store";
import { Box } from "@shopify/polaris";

function App() {
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  return (
    <>
      <BrowserRouter basename="/loyalty">
        <Provider store={store}>
          <AppLayout pages={pages} />
        </Provider>
      </BrowserRouter>
    </>
  );
}

function AppLayout({ pages }) {
  // Now you can safely use the hook here!
  const location = useLocation();

  return (
    <PolarisProvider>
      <>
        <NavMenu>
          {/* Use location.search instead of window.location.search */}
          <Link to={`/dashboard${location.search}`} rel="home">Dashboard</Link>
          <Link to={`/loyaltyProgram${location.search}`}>Loyalty Program</Link>
          <Link to={`/customer${location.search}`}>Customer</Link>
          <Link to={`/settings${location.search}`}>Settings</Link>
          <Link to={`/analytics${location.search}`}>Analytics</Link>
          <Link to={`/onsite${location.search}`}>Onsite</Link>
        </NavMenu>
      </>
      <Box paddingBlockEnd="1000">
        <Routes pages={pages} />
      </Box>
    </PolarisProvider>
  );
}

export default App;