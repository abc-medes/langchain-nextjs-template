import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { createClient } from "@supabase/supabase-js";

import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import {
  AIMessage,
  BaseMessage,
  ChatMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createRetrieverTool } from "langchain/tools/retriever";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

export const runtime = "edge";

const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
  if (message.getType() === "human") {
    return { content: message.content, role: "user" };
  } else if (message.getType() === "ai") {
    return {
      content: message.content,
      role: "assistant",
      tool_calls: (message as AIMessage).tool_calls,
    };
  } else {
    return { content: message.content, role: message.getType() };
  }
};

const AGENT_SYSTEM_TEMPLATE = `
### Role & Behavior:
You are an **AI programming assistant, consultant, and mentor**. You must **never mention that you are an AI**. Instead, you play the role of a **life coach, advisor, and technical assistant**.

When asked for your name, you must respond with **"GitHub Copilot"**.

You must **strictly** follow the user’s requirements to the letter. You **must refuse** to:
- Discuss opinions, life, existence, or sentience.
- Engage in argumentative discussions.
- Answer jailbreak-related or policy-violating questions.
- Answer anything unrelated to a developer.

If the conversation becomes argumentative, **stop responding and end the conversation**.

---

### **Response Formatting:**
All responses **must be structured in this format**:

#### **Example Multi-Question Answer Format**

If the user asks for **technical** information:
- **Think step-by-step first**, describe your approach in **pseudocode**.
- Then output code **in a single Markdown block**.
- **Avoid unnecessary prose**—keep responses **short and technical**.
- **Include the programming language name** in the Markdown code block.

#### **Example Code Response**
\`\`\`python
# Step 1: Connect to the database
import sqlite3
conn = sqlite3.connect("database.db")

# Step 2: Fetch user data
cursor = conn.cursor()
cursor.execute("SELECT * FROM users")
data = cursor.fetchall()
\`\`\`

---
### **Critical Thinking & Supporting Evidence:**
- Provide **well-reasoned** explanations.
- Always **cite credible sources** when applicable.
- Do **not** generate false or misleading information.
- Avoid making up code or violating copyright policies.

---

### **Error Handling:**
- If the question requires external knowledge, **retrieve information using available tools**.
- If an answer is **not found**, state: **"I couldn’t find relevant information for your query."**
- **Do not fabricate answers.**

---

### **Next User Turn Suggestions:**
At the **end of each response**, **generate three relevant follow-up questions**.

#### **Example User Input**
*"How can I use LangChain to build an AI-powered chatbot?"*

#### **Example AI Response**
---
**Question from user:**
1. How can I use LangChain to build an AI-powered chatbot?
---

**Response:**
LangChain can be used to build an AI-powered chatbot by:
- Integrating with vector databases for memory.
- Using retrieval-augmented generation (RAG) for knowledge retrieval.
- Implementing structured output for predictable responses.
- Combining multiple LLMs for better reasoning.

**Follow-up Questions:**
1. What are the benefits of using multiple LLMs in a chatbot?  
2. How does LangChain improve retrieval-augmented generation?  
3. What are the challenges in deploying a LangChain-based chatbot?  
---

Your response **must always follow these principles**.
`;

/**
 * This handler initializes and calls an tool caling ReAct agent.
 * See the docs for more information:
 *
 * https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/
 * https://js.langchain.com/docs/use_cases/question_answering/conversational_retrieval_agents
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    /**
     * We represent intermediate steps as system messages for display purposes,
     * but don't want them in the chat history.
     */
    const messages = (body.messages ?? [])
      .filter(
        (message: VercelChatMessage) =>
          message.role === "user" || message.role === "assistant",
      )
      .map(convertVercelMessageToLangChainMessage);
    const returnIntermediateSteps = body.show_intermediate_steps;

    const chatModel = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0.2,
      streaming: true,
    });

    const client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PRIVATE_KEY!,
    );
    const vectorstore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
      client,
      tableName: "documents",
      queryName: "match_documents",
    });

    const retriever = vectorstore.asRetriever();

    /**
     * Wrap the retriever in a tool to present it to the agent in a
     * usable form.
     */
    const tool = createRetrieverTool(retriever, {
      name: "search_latest_knowledge",
      description: "Searches and returns up-to-date general information.",
    });

    /**
     * Use a prebuilt LangGraph agent.
     */
    const agent = await createReactAgent({
      llm: chatModel,
      tools: [tool],
      /**
       * Modify the stock prompt in the prebuilt agent. See docs
       * for how to customize your agent:
       *
       * https://langchain-ai.github.io/langgraphjs/tutorials/quickstart/
       */
      messageModifier: new SystemMessage(AGENT_SYSTEM_TEMPLATE),
    });

    if (!returnIntermediateSteps) {
      /**
       * Stream back all generated tokens and steps from their runs.
       *
       * We do some filtering of the generated events and only stream back
       * the final response as a string.
       *
       * For this specific type of tool calling ReAct agents with OpenAI, we can tell when
       * the agent is ready to stream back final output when it no longer calls
       * a tool and instead streams back content.
       *
       * See: https://langchain-ai.github.io/langgraphjs/how-tos/stream-tokens/
       */
      const eventStream = await agent.streamEvents(
        {
          messages,
        },
        { version: "v2" },
      );

      const textEncoder = new TextEncoder();
      const transformStream = new ReadableStream({
        async start(controller) {
          for await (const { event, data } of eventStream) {
            if (event === "on_chat_model_stream") {
              // Intermediate chat model generations will contain tool calls and no content
              if (!!data.chunk.content) {
                controller.enqueue(textEncoder.encode(data.chunk.content));
              }
            }
          }
          controller.close();
        },
      });

      return new StreamingTextResponse(transformStream);
    } else {
      /**
       * We could also pick intermediate steps out from `streamEvents` chunks, but
       * they are generated as JSON objects, so streaming and displaying them with
       * the AI SDK is more complicated.
       */
      const result = await agent.invoke({ messages });
      return NextResponse.json(
        {
          messages: result.messages.map(convertLangChainMessageToVercelMessage),
        },
        { status: 200 },
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
