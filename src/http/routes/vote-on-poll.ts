import { z } from "zod";
import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma";
import { FastifyInstance } from "fastify";

export const voteOnPoll = async (app: FastifyInstance) => {
  app.post("/polls/:pollId/votes", async (request, reply) => {
    const voteOnPollParams = z.object({
      pollId: z.string().uuid(),
    });

    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid(),
    });

    const { pollId } = voteOnPollParams.parse(request.params);
    const { pollOptionId } = voteOnPollBody.parse(request.body);

    // identify the user
    let { sessionId } = request.cookies;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.setCookie("sessionId", sessionId, {
        path: "/", // accessible from all routes
        signed: true, // cannot be altered by the client
        httpOnly: true, // cannot only be accessed by this server
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return reply.status(201).send({ sessionId });
  });
};
