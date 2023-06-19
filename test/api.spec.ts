import getPort from "get-port";
import { Miniflare } from "miniflare";
import { join } from "path";
import { UnstableDevWorker, unstable_dev } from "wrangler";

const relativePath = (path: string) => join(__dirname, ...path.split("/"));
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let wranglerServer: UnstableDevWorker;
let miniflareServer: Miniflare;
let wranglerApiUrl: string;
let miniflareApiUrl: string;

beforeAll(async () => {
  wranglerServer = await unstable_dev(relativePath("../dist/worker.js"), { experimental: { disableExperimentalWarning: true } });
  wranglerApiUrl = `http://localhost:${wranglerServer.port}`;

  const port = await getPort();
  miniflareServer = new Miniflare({ port, modules: true, scriptPath: relativePath("../dist/worker.js") });
  miniflareApiUrl = `http://localhost:${port}`;
  await sleep(1000); // wait for miniflare server to start ¯\_(ツ)_/¯
});

afterAll(async () => {
  await wranglerServer.stop();
  await miniflareServer.dispose();
});

describe("GET /users/:id", () => {
  it("should return a specific user (trough wrangler server)", async () => {
    const expectedUser = { id: 1, name: "John Doe" };

    // mocking internal fetch call
    const fetchMock = getMiniflareFetchMock();
    const origin = fetchMock.get("https://jsonplaceholder.typicode.com");
    origin.intercept({ method: "GET", path: "/users/1" }).reply(200, expectedUser);

    const response = await fetch(`${wranglerApiUrl}/users/1`);
    const user = await response.json();

    expect(user).toHaveProperty("name", expectedUser.name); // asserting response fails (┬┬﹏┬┬)
    // AssertionError: expected { id: 1, name: 'Leanne Graham', …(6) } to have property "name" with value 'John Doe'
  });

  it("should return a specific user (trough miniflare server)", async () => {
    const expectedUser = { id: 1, name: "John Doe" };

    // mocking internal fetch call
    const fetchMock = getMiniflareFetchMock();
    const origin = fetchMock.get("https://jsonplaceholder.typicode.com");
    origin.intercept({ method: "GET", path: "/users/1" }).reply(200, expectedUser);

    const response = await fetch(`${miniflareApiUrl}/users/1`);
    const user = await response.json();

    expect(user).toHaveProperty("name", expectedUser.name); // asserting response fails (┬┬﹏┬┬)
    // AssertionError: expected { id: 1, name: 'Leanne Graham', …(6) } to have property "name" with value 'John Doe'
  });
});
