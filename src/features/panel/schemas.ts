import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Geçerli bir e-posta adresi girin."),
  password: z.string().min(1, "Şifrenizi girin.").max(128),
  // Where to go after signing in. Only panel paths are accepted (11-guvenlik §7: open redirect).
  donus: z
    .string()
    .regex(/^\/panel(\/[\w\-/]*)?(\?[\w=&%-]*)?$/)
    .optional()
    .catch(undefined),
});

export type SignInState = {
  message?: string;
  fieldErrors?: { email?: string[]; password?: string[] };
  email?: string;
};
