import { App } from "./app/App";
import { transformRscToHtmlStream } from "./render/transformRscToHtmlStream";
import { injectRSCPayload } from "rsc-html-stream/server";
import { renderToRscStream } from "./render/renderToRscStream";
import { ssrWebpackRequire } from "./imports/worker";
import { rscActionHandler } from "./register/worker";
import { TwilioClient } from "./twilio";
import { AI, setupAI } from "./ai";
// import { setupAI } from "./ai";
// import { TwilioClient } from "./twilio";
export default {
  async fetch(request: Request, env: Env) {
    globalThis.__webpack_require__ = ssrWebpackRequire;

    try {
      const url = new URL(request.url);

      const isRSCRequest = url.searchParams.has("__rsc");
      const isRSCActionHandler = url.searchParams.has("__rsc_action_id");

      if (isRSCActionHandler) {
        await rscActionHandler(request);
      }

      if (url.pathname.startsWith("/assets/")) {
        url.pathname = url.pathname.slice("/assets/".length);
        return env.ASSETS.fetch(new Request(url.toString(), request));
      }

      setupAI(env);

      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        prompt: "What is the origin of the phrase Hello, World",
      });
      console.log('###', response);

      if (request.method === "POST" && request.url.includes("/incoming")) {
        console.log("Incoming request received");
        const body = await request.text();
        const bodyData = new URLSearchParams(body);
        const attachmentUrl = bodyData.get("MediaUrl0");
        const originalMessageSid = bodyData.get("MessageSid");
        console.log("MessageSid", originalMessageSid);
        console.log("AttachmentUrl", attachmentUrl);
        if (attachmentUrl) {
          const twilioClient = new TwilioClient(env);
          const mediaUrl = await twilioClient.getMediaUrlFromTwilio(
            attachmentUrl,
          );
          const blob = await fetch(mediaUrl).then((res) => res.blob()); // fetch the audio blob
          //while waiting for the audio to be transcribed, send a message to the user
          await twilioClient.sendWhatsAppMessage(
            "Give me a moment while I transcribe your message...",
            bodyData.get("From")!,
            originalMessageSid,
          );
          const transcription = await AI.transcribeAudio(blob); // transcribe the audio blob
          await twilioClient.sendWhatsAppMessage(
            transcription!,
            bodyData.get("From")!,
            originalMessageSid,
          );
          // return new Response("OK", { status: 200 });
          return;
        }
        const twilioClient = new TwilioClient(env);
        await twilioClient.sendWhatsAppMessage(
          "Replying to your message...",
          bodyData.get("From")!,
          originalMessageSid,
        );
        return new Response("OK", { status: 200 });
        // return new Response("No audio attachment", { status: 400 });
      }

      return new Response("OK", { status: 200 });
    } catch (e) {
      console.error("Unhandled error", e);
      throw e;
    }
  },
};
