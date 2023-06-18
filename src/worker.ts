import { Hono } from "hono";

const app = new Hono();

app.get("/users/:id", async (c) => {
  const userId = c.req.param("id");

  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
  const user = await response.json();

  return c.json(user);
});

export default app;
