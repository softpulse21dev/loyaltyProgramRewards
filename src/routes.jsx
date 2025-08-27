import {
    Routes as ReactRouterRoutes,
    Route,
    Navigate,
    useLocation,
} from "react-router-dom";

/**
 * File-based routing.
 */
export default function Routes({ pages }) {
    const routes = useRoutes(pages);
    const location = useLocation();

    const routeComponents = routes.map(({ path, component: Component }) => (
        <Route key={path} path={path} element={<Component />} />
    ));

    // Find a NotFound page if one exists
    const NotFound =
        routes.find(({ path }) => path === "/:catchAll")?.component ||
        (() => (
            <Navigate to={`/dashboard${location.search}`} replace />
        ));

    return (
        <ReactRouterRoutes>
            {/* Redirect `/` to `/dashboard` with query params */}
            <Route
                path="/"
                element={<Navigate to={`/dashboard${location.search}`} replace />}
            />

            {routeComponents}

            {/* Catch-all fallback */}
            <Route path="*" element={<NotFound />} />
        </ReactRouterRoutes>
    );
}

function useRoutes(pages) {
    return Object.keys(pages)
        .map((key) => {
            let path = key
                .replace("./pages", "")
                .replace("./proxy", "")
                .replace(/\.(t|j)sx?$/, "")
                .replace("$", ":")
                .replace(/\/index$/i, "/")
                .replace(/\b[A-Z]/, (firstLetter) => firstLetter.toLowerCase())
                .replace(/\[(?:[.]{3})?(\w+?)\]/g, (_match, param) => `:${param}`);

            if (path.endsWith("/") && path !== "/") {
                path = path.substring(0, path.length - 1);
            }

            if (!pages[key].default) {
                console.warn(`${key} doesn't export a default React component`);
                return null;
            }

            return {
                path,
                component: pages[key].default,
            };
        })
        .filter(Boolean);
}
