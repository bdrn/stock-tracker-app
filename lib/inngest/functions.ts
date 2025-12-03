import { sendWelcomeEmail, sendNewsEmail } from "@/lib/nodemailer";
import { inngest } from "@/lib/inngest/client";
import {
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
  NEWS_SUMMARY_EMAIL_PROMPT,
} from "@/lib/inngest/prompts";
import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews } from "../actions/finnhub.actions";
export const sendSignUpEmail = inngest.createFunction(
  { id: "sign-up-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    const userProfile = `
        - Country: ${event.data.country}
        - Investment Goals: ${event.data.investmentGoals}
        - Risk Tolerance: ${event.data.riskTolerance}
        - Preferred Industry: ${event.data.preferredIndustry}
        `;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{{userProfile}}",
      userProfile
    );

    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({ model: "gemini-2.5-flash" }),
      body: {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
    });

    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thanks for joining Signalist. You now have the tools to track markets and make smarter moves";

      const {
        data: { email, name },
      } = event;

      return await sendWelcomeEmail({
        email,
        name,
        intro: introText,
      });
    });

    return {
      success: true,
      message: "Welcome email sent successfully",
    };
  }
);

export const sendDailyNewsSummary = inngest.createFunction(
  { id: "send-daily-news-summary" },
  [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
  async ({ step }) => {
    // Step 1: Get all users
    const users = await step.run("get-all-users", getAllUsersForNewsEmail);

    if (!users || users.length === 0) {
      return {
        success: false,
        message: "No users found for news email",
      };
    }

    // Step 2: For each user, get watchlist symbols → fetch news (or general if none)
    for (const user of users) {
      // Get watchlist symbols and fetch news for this user
      const userNews = await step.run(`get-news-for-${user.id}`, async () => {
        const symbols = await getWatchlistSymbolsByEmail(user.email);
        const news = await getNews(symbols.length > 0 ? symbols : undefined);

        // Limit to max 6 articles
        return news.slice(0, 6);
      });

      // Step 3: Summarize news via AI
      const summaryResult = await step.run(
        `summarize-news-for-${user.id}`,
        async () => {
          if (!userNews || userNews.length === 0) {
            return { userId: user.id, newsContent: null };
          }

          // Format news data for the prompt
          const newsData = JSON.stringify(
            userNews.map((article) => ({
              headline: article.headline,
              summary: article.summary,
              source: article.source,
              url: article.url,
              datetime: new Date(article.datetime * 1000).toLocaleDateString(),
              category: article.category,
              related: article.related,
            })),
            null,
            2
          );

          const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
            "{{newsData}}",
            newsData
          );

          const response = await step.ai.infer(
            `generate-news-summary-${user.id}`,
            {
              model: step.ai.models.gemini({ model: "gemini-2.5-flash" }),
              body: {
                contents: [
                  {
                    role: "user",
                    parts: [{ text: prompt }],
                  },
                ],
              },
            }
          );

          const part = response.candidates?.[0]?.content?.parts?.[0];
          const newsContent =
            (part && "text" in part ? part.text : null) ||
            "<p class='mobile-text dark-text-secondary' style='margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;'>No news available at this time.</p>";

          return { userId: user.id, newsContent };
        }
      );

      // Step 4: Send the email
      await step.run(`send-email-for-${user.id}`, async () => {
        if (!summaryResult.newsContent) {
          console.log(`Skipping email for user ${user.id} - no news content`);
          return { userId: user.id, sent: false };
        }

        const today = new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        await sendNewsEmail({
          email: user.email,
          name: user.name,
          date: today,
          newsContent: summaryResult.newsContent,
        });

        return { userId: user.id, sent: true };
      });
    }

    return {
      success: true,
      message: `Processed news for ${users.length} users`,
    };
  }
);
