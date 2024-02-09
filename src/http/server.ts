import fastify from "fastify";
import { createPoll } from "./routes/create-poll";
import { getPoll } from "./routes/get-poll";
import { voteOnPoll } from "./routes/vote-on-poll";
import fastifyCookie from "@fastify/cookie";

const app = fastify();

app.register(fastifyCookie, {
  secret: "polls-app-nlw", // for cookies to be signed
  hook: "onRequest", // run before the route handler
});
app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP Server Running on port 3333");
});
