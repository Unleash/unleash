import { screen } from "@testing-library/react";
import { render } from "utils/testRenderer";
import { useDefaultStrategy } from "./EditDefaultStrategy";
import { testServerRoute, testServerSetup } from "utils/testServer";

const server = testServerSetup();

const RenderStrategy = () => {
    const { strategy } = useDefaultStrategy("default", "development");

    return <div>{strategy?.name ?? "no-default-strategy"}</div>;
};

// const RenderFallbackStrategy = () => {
//     const { defaultStrategyFallback } = useDefaultStrategy(
//         "default",
//         "development"
//     );

//     return <div>{defaultStrategyFallback.parameters.stickiness}</div>;
// };

// test("should render default strategy from project", async () => {
//     testServerRoute(server, "/api/admin/projects/default", {
//         environments: [
//             {
//                 environment: "development",
//                 defaultStrategy: { name: "my-strategy" },
//             },
//         ],
//     });
//     render(<RenderStrategy />);

//     await screen.findByText("my-strategy");
// });

// test("should render fallback default strategy with project default stickiness", async () => {
//     testServerRoute(server, "/api/admin/projects/default", {
//         defaultStickiness: "clientId",
//         environments: [],
//     });
//     render(<RenderFallbackStrategy />);

//     await screen.findByText("clientId");
// });

// test("should render fallback default strategy with no project default stickiness", async () => {
//     testServerRoute(server, "/api/admin/projects/default", {
//         environments: [],
//     });
//     render(<RenderFallbackStrategy />);

//     await screen.findByText("default");
// });

import axios from 'axios';

test('Do the thing', async () => {
    testServerRoute(server, "/api/admin/projects/default", {
        environments: [],
    });

  const response = await axios.get('http://localhost:3000/api/admin/projects/default');
  expect(response.status).toBe(200);
  expect(response.data).toEqual({ username: 'admin', email: 'admin@example.com' });
});