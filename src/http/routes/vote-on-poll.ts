import { z } from "zod";
import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma";
import { FastifyInstance } from "fastify";
import { redis } from "../../lib/redis";

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

    if (sessionId) {
      // find a vote based on the created index (more efficient)
      const userPreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId,
          },
        },
      });

      if (
        userPreviousVoteOnPoll &&
        userPreviousVoteOnPoll.pollOptionId !== pollOptionId
      ) {
        // delete the previous vote to allow change of vote in the same poll
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnPoll.id,
          },
        });

        // decrease past pollOption votes by one in the current poll
        await redis.zincrby(pollId, -1, userPreviousVoteOnPoll.pollOptionId);
      } else if (userPreviousVoteOnPoll) {
        return reply.status(400).send({
          error: "You have already voted on this poll",
        });
      }
    }

    if (!sessionId) {
      sessionId = randomUUID();

      reply.setCookie("sessionId", sessionId, {
        path: "/", // accessible from all routes
        signed: true, // cannot be altered by the client
        httpOnly: true, // cannot only be accessed by this server
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    const vote = await prisma.vote.create({
      data: {
        pollId,
        pollOptionId,
        sessionId,
      },
    });

    // increase current pollOption votes by one in the current poll
    await redis.zincrby(pollId, 1, pollOptionId);

    return reply.status(201).send({ vote });
  });
};
