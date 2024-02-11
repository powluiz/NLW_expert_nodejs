import { FastifyInstance } from "fastify";

export const pollResults = async (app: FastifyInstance) => {
  app.get(
    "/polls/:pollId/results",
    { websocket: true },
    (connection, request) => {
      connection.socket.on("message", (message: string) => {
        connection.socket.send(`Hello, you sent ${message}`);
      });
    }
  );
};
