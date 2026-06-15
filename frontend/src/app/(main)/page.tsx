import { Metadata } from "next";
import ChatClient from "./ChatClient";

export const metadata: Metadata = {
  title: "Chat | PromptRouter",
  description: "Chat with multiple AI models through an intelligent routing layer.",
};

export default function Page() {
  return <ChatClient />;
}
