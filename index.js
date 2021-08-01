require("dotenv").config();
const { getHash } = require("emoji-hash-gen");
const { App } = require("@slack/bolt");
var Airtable = require("airtable");
var crypto = require("crypto");
var md5sum = crypto.createHash("md5");
var base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
);
var banned = [];
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

/* Add functionality here */

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
app.shortcut("delete_me", async ({ ack, body, say }) => {
  ack();
  if (
    [
      "UJYDFQ2QL",
      "UHFEGV147",
      "U01D6FYHLUW",
      "UM4BAKT6U",
      "U0128N09Q8Y",
    ].includes(body.user.id)
  ) {
    await app.client.chat.delete({
      token: process.env.SLACK_BOT_TOKEN,
      ts: body.message.ts,
      channel: body.channel.id,
    });
    await app.client.chat.postEphemeral({
      token: process.env.SLACK_BOT_TOKEN,
      channel: body.channel.id,
      user: body.user.id,
      text: `doned`,
    });
    return;
  }
  await app.client.chat.postEphemeral({
    token: process.env.SLACK_BOT_TOKEN,
    channel: body.channel.id,
    user: body.user.id,
    text: `grrr stop bullying`,
  });
});
app.shortcut("reply_impression", async ({ ack, body, say }) => {
  await ack();
  if (body.channel.id !== "C02A6BRM2JD") {
    await app.client.chat.postEphemeral({
      token: process.env.SLACK_BOT_TOKEN,
      channel: body.channel.id,
      user: body.user.id,
      text: `Post the honest impression in <#C029QJD8M0D>`,
    });
    return;
  }

  await app.client.views.open({
    // Pass a valid trigger_id within 3 seconds of receiving it
    trigger_id: body.trigger_id,
    // View payload
    view: {
      type: "modal",
      // View identifier
      callback_id: "impression_id",
      title: {
        type: "plain_text",
        text: "Honest Impressions Reply",
      },
      blocks: [
        {
          type: "input",
          block_id: "input_c",
          label: {
            type: "plain_text",
            text: "Honestly I think....",
          },
          element: {
            type: "plain_text_input",
            action_id: "dreamy_input",
            multiline: true,
          },
        },
      ],
      submit: {
        type: "plain_text",
        text: "Submit",
      },
      private_metadata: body.message_ts,
    },
  });
});

app.view("impression_id", async ({ ack, body, view, client }) => {
  const userHash = crypto.createHash("md5").update(body.user.id).digest("hex");
  await base("Messages").create([
    {
      fields: {
        hash: userHash,
        message: view.state.values.input_c.dreamy_input.value,
      },
    },
  ]);
  ack();
  if (!banned.includes(userHash)) {
    app.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: "C02A6BRM2JD", // #honest-impressions
      thread_ts: view.private_metadata,
      text: view.state.values.input_c.dreamy_input.value,
    });
  }
});
