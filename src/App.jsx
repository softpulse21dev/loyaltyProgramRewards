import { NavMenu } from "@shopify/app-bridge-react";
import { BrowserRouter, Link, useLocation } from "react-router-dom";
import Routes from "./routes";
import { PolarisProvider } from "./components/provider/PolarisProvider";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { Box } from "@shopify/polaris";
import { LoyaltyDataProvider } from "./context/LoyaltyDataContext";

function App() {
  const pages = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });
  return (
    <>
      <BrowserRouter basename="/loyalty">
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <LoyaltyDataProvider>
              <AppLayout pages={pages} />
            </LoyaltyDataProvider>
          </PersistGate>
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
          <Link to={`/customers${location.search}`}>Customers</Link>
          <Link to={`/settings${location.search}`}>Settings</Link>
          <Link to={`/analytics${location.search}`}>Analytics</Link>
          <Link to={`/widget${location.search}`}>Widget</Link>
          <Link to={`/emails${location.search}`}>Emails</Link>
        </NavMenu>
      </>
      <Box paddingBlockEnd="1000">
        <Routes pages={pages} />
      </Box>
    </PolarisProvider>
  );
}

export default App;