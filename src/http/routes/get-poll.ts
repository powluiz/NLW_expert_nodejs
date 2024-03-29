import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { FastifyInstance } from "fastify";
import { redis } from "../../lib/redis";

export const getPoll = async (app: FastifyInstance) => {
  app.get("/polls/:pollId", async (request, reply) => {
    console.log(request);

    const getPollParams = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = getPollParams.parse(request.params);

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!poll) {
      return reply.status(400).send({ error: "Poll not found" });
    }
    const result = await redis.zrange(pollId, 0, -1, "WITHSCORES");

    // result come in pairs: an odd index is the optionId and an even index is the equivalent score)
    const votes = result.reduce((obj, cur, index) => {
      if (index % 2 === 0) {
        const score = result[index + 1]; // gets the equivalent score
        Object.assign(obj, { [cur]: Number(score) });
      }
      return obj;
    }, {} as Record<string, number>);

    return reply.status(200).send({
      poll: {
        id: poll.id,
        title: poll.title,
        options: poll.options.map((option) => {
          return {
            id: option.id,
            title: option.title,
            score: votes[option.id] || 0,
          };
        }),
      },
    });
  });
};
