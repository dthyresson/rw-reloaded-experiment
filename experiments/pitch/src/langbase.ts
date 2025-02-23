import { Langbase } from "langbase";

export let langbase: Langbase;

export const createLangbaseClient = (env: Env) =>
  new Langbase({
    apiKey: env.LANGBASE_API_KEY!,
  });

export const setupLangbase = async (env: Env) => {
  console.log("setupLangbase", env.LANGBASE_API_KEY);
  langbase = createLangbaseClient(env);
};
