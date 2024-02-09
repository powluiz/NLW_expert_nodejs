import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { FastifyInstance } from "fastify";

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
    console.log(poll);

    return reply.status(200).send({ poll });
  });
};
