import { Router, type IRouter } from "express";
import crypto from "crypto";
import { AuthenticateSourceCodeBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SOURCE_CODE_PASSWORD = process.env.SOURCE_CODE_PASSWORD ?? "anas#wanda1";

// Store issued tokens in-memory so source route can validate them
export const validTokens = new Set<string>();

router.post("/auth/source-code", async (req, res): Promise<void> => {
  const parsed = AuthenticateSourceCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { password } = parsed.data;

  const expected = Buffer.from(SOURCE_CODE_PASSWORD);
  const received = Buffer.from(password);

  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  validTokens.add(token);
  res.json({ token });
});

export default router;
