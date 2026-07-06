type SlackPostParams = {
  channel: string;
  text: string;
  threadTs?: string;
  username?: string;
  iconUrl?: string;
};

async function slackApi(method: string, body: Record<string, string>) {
  const token = process.env.SLACK_BOT_TOKEN?.trim();
  if (!token) {
    throw new Error("SLACK_BOT_TOKEN is not configured");
  }

  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });

  const data = (await res.json()) as { ok: boolean; error?: string; ts?: string };
  if (!data.ok) {
    throw new Error(`Slack ${method}: ${data.error ?? "unknown error"}`);
  }
  return data;
}

export async function postSlackMessage(params: SlackPostParams) {
  const body: Record<string, string> = {
    channel: params.channel,
    text: params.text,
  };
  if (params.threadTs) body.thread_ts = params.threadTs;
  if (params.username) body.username = params.username;
  if (params.iconUrl) body.icon_url = params.iconUrl;

  const data = await slackApi("chat.postMessage", body);
  return { ts: data.ts ?? null };
}
