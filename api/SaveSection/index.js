// Azure Functions - Node 18+ (fetch API is globally available)

// Utility: escape regex special chars in section headings
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Utility: replace the markdown between "## {tag}" and the next "## ..."
// Uses a case-insensitive regex so "## summary" matches even if dropdown is "Summary"
function replaceSection(markdown, tag, newContent) {
  const safe = escapeRegExp(tag.trim()); 
  const re = new RegExp(
    `(^|\\n)##\\s+${safe}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 
    "mi" // m = multiline, i = case-insensitive
  );
  if (!re.test(markdown)) return null;  // section not found
  // Replace the captured section content with the new content
  return markdown.replace(re, (_, prefix) => `${prefix}## ${tag}\n${newContent}\n`);
}

// Default export = the Azure Function entry point
export default async function (context, req) {
  try {
    // Pull config from environment variables (set in Azure Portal --> Configuration)
    const {
      GITHUB_PAT,                         // GitHub Personal Access Token
      GITHUB_OWNER,                       
      GITHUB_REPO,                        // Repo name
      GITHUB_BRANCH = "main",             // Branch to update
      GITHUB_FILEPATH = "app/resume.md",  // Path to resume.md in repo
      GITHUB_COMMIT_NAME = "Resume Bot",  // Commit author name
      GITHUB_COMMIT_EMAIL = "resume-bot@example.com" // Commit author email
    } = process.env;

    // Ensure critical env vars exist, otherwise fail
    if (!GITHUB_PAT || !GITHUB_OWNER || !GITHUB_REPO) {
      return context.res = { status: 500, body: "Server not configured." };
    }

    // Parse JSON body from the POST request: { section, content }
    const { section, content } = await req.json();
    if (!section || typeof content !== "string") {
      return context.res = { status: 400, body: "Need 'section' and 'content'." };
    }

    // 1) Fetch the current resume.md file from GitHub
    const base = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(GITHUB_FILEPATH)}`;
    const getResp = await fetch(`${base}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, {
      headers: { Authorization: `token ${GITHUB_PAT}`, "User-Agent": "resume-updater" }
    });
    if (!getResp.ok) {
      const t = await getResp.text();
      return context.res = { status: 502, body: `GitHub GET failed: ${getResp.status} ${t}` };
    }
    const current = await getResp.json();
    const markdown = Buffer.from(current.content, "base64").toString("utf8"); // decode file

    // 2) Replace the requested section in the markdown
    const updated = replaceSection(markdown, section, content);
    if (updated == null) {
      return context.res = { status: 404, body: `Section "## ${section}" not found.` };
    }
    if (updated === markdown) {
      return context.res = { status: 200, body: { ok: true, changed: false } };
    }

    // Encode the updated markdown back to base64 (GitHub API requirement)
    const newContentB64 = Buffer.from(updated, "utf8").toString("base64");

    // 3) Commit the new content back to GitHub via PUT request
    const putResp = await fetch(base, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_PAT}`,
        "User-Agent": "resume-updater",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `chore(resume): update section "${section}" via web editor`,
        content: newContentB64,  // base64-encoded new file
        sha: current.sha,        // required: tells GitHub which file version we’re replacing
        branch: GITHUB_BRANCH,   // branch to commit to
        committer: { name: GITHUB_COMMIT_NAME, email: GITHUB_COMMIT_EMAIL }
      })
    });

    // If commit failed, return error
    if (!putResp.ok) {
      const t = await putResp.text();
      return context.res = { status: 502, body: `GitHub PUT failed: ${putResp.status} ${t}` };
    }

    // Success: changes were committed
    return context.res = { status: 200, body: { ok: true, changed: true } };

  } catch (err) {
    // Any other error bubbles out here
    return context.res = { status: 500, body: String(err) };
  }
}

