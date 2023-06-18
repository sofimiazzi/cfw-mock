import { join } from "path";
import { UnstableDevWorker, unstable_dev } from "wrangler";

const relativePath = (path: string) => join(__dirname, ...path.split("/"));
let worker: UnstableDevWorker;
let apiUrl: string;

beforeAll(async () => {
  worker = await unstable_dev(relativePath("../src/worker.ts"), { experimental: { disableExperimentalWarning: true } });
  apiUrl = `http://localhost:${worker.port}`;
});

afterAll(async () => {
  await worker.stop();
});

describe("GET /users/:id", () => {
  it("should return a specific user", async () => {
    const expectedUser = { id: 1, name: "John Doe" };

    // mocking internal fetch call
    const fetchMock = getMiniflareFetchMock();
    const origin = fetchMock.get("https://jsonplaceholder.typicode.com");
    origin.intercept({ method: "GET", path: "/users/1" }).reply(200, expectedUser);

    const response = await fetch(`${apiUrl}/users/1`);
    const user = await response.json();

    expect(user).toHaveProperty("name", expectedUser.name); // asserting response fails :(
    // AssertionError: expected { id: 1, name: 'Leanne Graham', …(6) } to have property "name" with value 'John Doe'
  });
});
