const fs = require("fs");
const { execSync } = require("child_process");

// Get the ISO week number for a given date
const getISOWeek = (dateString) => {
  const date = new Date(dateString);
  const day = date.getUTCDay() || 7; // Adjust Sunday to be the last day
  date.setUTCDate(date.getUTCDate() + 4 - day); // Set to the nearest Thursday
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7); // Calculate ISO week number
};

// Get the year and week for grouping
const getYearWeek = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) {
    console.error(`Invalid date encountered: ${dateString}`);
    return null;
  }
  return `${date.getUTCFullYear()}-W${String(getISOWeek(dateString)).padStart(
    2,
    "0"
  )}`;
};

// Get the initial commit date
const getInitialCommitDate = () => {
  return execSync("git log --reverse --format=%cd --date=short | head -n 1")
    .toString()
    .trim();
};

// Calculate the major version based on the year
const getMajorVersion = (commitDate) => {
  const initialDate = new Date(getInitialCommitDate());
  const commitYear = new Date(commitDate).getFullYear();
  return commitYear - initialDate.getFullYear() + 1;
};

// Parse commit messages
const parseCommitMessage = (message) => {
  const lines = message.split("\n").map((line) => line.trim());
  const subjectLine = lines.shift();
  const notes = lines.map((line) => line.replace(/^- /, "").trim());
  return {
    subject: subjectLine || "No subject",
    notes: notes.filter((note) => note), // Remove empty notes
  };
};

// Group commits by week
const getCommitsGroupedByWeek = () => {
  try {
    const commits = execSync(
      'git log --pretty=format:"%cd|%s%n%b^^" --date=short'
    )
      .toString()
      .trim();
    const commitGroups = {};
    const commitEntries = commits
      .split("^^")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0); // Skip empty entries

    commitEntries.forEach((entry) => {
      const [date, ...messageLines] = entry.split("|");
      if (!date || messageLines.length === 0) {
        console.error(`Malformed commit entry: ${entry}`);
        return; // Skip malformed entries
      }

      const message = messageLines.join("\n");
      const yearWeek = getYearWeek(date);

      if (!yearWeek) {
        console.error(`Invalid year-week for date: ${date}`);
        return; // Skip invalid dates
      }

      if (!commitGroups[yearWeek]) {
        commitGroups[yearWeek] = [];
      }
      commitGroups[yearWeek].push(parseCommitMessage(message));
    });

    return commitGroups;
  } catch (error) {
    console.error("Error getting commits:", error);
    return {};
  }
};

// Generate the changelog
const generateChangelog = () => {
  const changelogPath = "./changelog.json";
  const commitsGroupedByWeek = getCommitsGroupedByWeek();

  if (Object.keys(commitsGroupedByWeek).length === 0) {
    console.log("No new commits found.");
    return;
  }

  const initialCommitDate = getInitialCommitDate();
  const weeks = Object.keys(commitsGroupedByWeek).sort(); // Sort weeks chronologically
  let minorVersion = weeks.length; // Start with the total number of weeks

  const newEntries = weeks.reverse().map((yearWeek) => {
    const changes = commitsGroupedByWeek[yearWeek] || [];
    const [year] = yearWeek.split("-W");
    const majorVersion = getMajorVersion(initialCommitDate);

    if (changes.length === 0) {
      minorVersion -= 1; // Skip empty weeks
      return null;
    }

    const patchVersion = changes.length; // Number of changes in this batch

    const entry = {
      version: `${majorVersion}.${minorVersion}.${patchVersion}`,
      week: yearWeek,
      dateRange: `${year}, Week ${yearWeek.split("-W")[1]}`, // For better clarity
      changes,
    };

    minorVersion -= 1; // Decrement for next batch
    return entry;
  });

  // Remove null entries (empty weeks)
  const validEntries = newEntries.filter((entry) => entry !== null);

  // Ensure the file is empty before writing to it
  fs.writeFileSync(changelogPath, JSON.stringify([], null, 2));

  // Write the new changelog entries
  fs.writeFileSync(changelogPath, JSON.stringify(validEntries, null, 2));
  console.log(`Changelog updated with ${validEntries.length} new entries`);
};

generateChangelog();
