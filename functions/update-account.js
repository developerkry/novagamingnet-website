require("dotenv").config(); // Load environment variables
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { Octokit } = require("@octokit/rest"); // GitHub API client
const { v4: uuidv4 } = require("uuid"); // Generate unique filenames
const { Readable } = require("stream"); // Import Readable for stream conversion

const mongoURI = process.env.MONGO_URI;
const githubToken = process.env.GITHUB_TOKEN; // GitHub personal access token
const githubRepo = process.env.GITHUB_REPO; // Format: "username/repository"
const githubBranch = process.env.GITHUB_BRANCH || "main"; // Default branch

async function uploadToGitHub(filePath, fileContent) {
  const octokit = new Octokit({ auth: githubToken });
  const fileName = `${uuidv4()}-${path.basename(filePath)}`;
  const filePathInRepo = `avatars/${fileName}`; // Path in the GitHub repository

  try {
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: githubRepo.split("/")[0],
      repo: githubRepo.split("/")[1],
      path: filePathInRepo,
      message: `Upload avatar: ${fileName}`,
      content: fileContent.toString("base64"),
      branch: githubBranch,
    });

    console.log(`Avatar uploaded to GitHub: ${data.content.download_url}`);
    return `https://cdn.jsdelivr.net/gh/${githubRepo}@${githubBranch}/${filePathInRepo}`;
  } catch (error) {
    console.error("Error uploading avatar to GitHub:", error);
    throw new Error("Failed to upload avatar to GitHub");
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const contentType = event.headers["content-type"] || event.headers["Content-Type"];

  if (contentType.includes("multipart/form-data")) {
    // Convert the body to a readable stream for formidable
    const bodyStream = Readable.from(event.body);

    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "../../uploads/avatars"); // Ensure this directory exists
    form.keepExtensions = true;

    return new Promise((resolve) => {
      form.parse(bodyStream, async (err, fields, files) => {
        if (err) {
          if (err.message.includes("content-length")) {
            console.warn("Missing content-length header. Proceeding without it.");
          } else {
            console.error("Error parsing form:", err);
            return resolve({
              statusCode: 500,
              body: JSON.stringify({ error: "Failed to process form data" }),
            });
          }
        }

        const username = Array.isArray(fields.username) ? fields.username[0] : fields.username; // Ensure username is a string
        const password = fields.password;
        const newUsername = fields.newUsername;
        const newEmail = fields.newEmail;
        const newPassword = fields.newPassword;
        const avatarFile = files.avatar;

        console.log("Parsed fields:", fields); // Debugging log
        console.log("Parsed files:", files); // Debugging log

        if (!username) {
          console.error("Username is missing in the request.");
          return resolve({
            statusCode: 400,
            body: JSON.stringify({ error: "Username is required" }),
          });
        }

        try {
          const client = new MongoClient(mongoURI);
          await client.connect();
          const db = client.db("web");
          const usersCollection = db.collection("users");

          console.log(`Searching for user with username: ${username}`); // Debugging log
          const user = await usersCollection.findOne({ username });

          if (!user) {
            console.error(`User not found for username: ${username}`);
            return resolve({
              statusCode: 404,
              body: JSON.stringify({ error: "User not found" }),
            });
          }

          if (password && !(await bcrypt.compare(password, user.password))) {
            return resolve({
              statusCode: 401,
              body: JSON.stringify({ error: "Invalid password" }),
            });
          }

          // Prepare updates
          const updates = {};
          if (newUsername) {
            const usernameExists = await usersCollection.findOne({ username: newUsername });
            if (usernameExists) {
              return resolve({
                statusCode: 409,
                body: JSON.stringify({ error: "Username already exists" }),
              });
            }
            updates.username = newUsername;
          }
          if (newEmail) {
            const emailExists = await usersCollection.findOne({ email: newEmail });
            if (emailExists) {
              return resolve({
                statusCode: 409,
                body: JSON.stringify({ error: "Email already exists" }),
              });
            }
            updates.email = newEmail;
          }
          if (newPassword) updates.password = await bcrypt.hash(newPassword, 10);

          // Save avatar file to GitHub and update the avatar URL
          if (avatarFile && avatarFile.filepath) {
            try {
              console.log(`Processing avatar file: ${avatarFile.filepath}`); // Debugging log

              // Read the file content into memory immediately
              const fileContent = fs.readFileSync(avatarFile.filepath);

              // Upload the file content to GitHub
              const avatarUrl = await uploadToGitHub(avatarFile.filepath, fileContent);
              updates.avatar = avatarUrl;
              console.log(`Avatar uploaded successfully: ${avatarUrl}`); // Debugging log
            } catch (error) {
              console.error("Error uploading avatar:", error);
              return resolve({
                statusCode: 500,
                body: JSON.stringify({ error: "Failed to upload avatar" }),
              });
            }
          }

          // Update the user document
          const updateResult = await usersCollection.updateOne(
            { username },
            { $set: updates }
          );

          if (updateResult.modifiedCount > 0) {
            console.log(`User document updated successfully for username: ${username}`);
          } else {
            console.error(`Failed to update user document for username: ${username}`);
          }

          await client.close();

          return resolve({
            statusCode: 200,
            body: JSON.stringify({ message: "Account updated successfully", avatar: updates.avatar }),
          });
        } catch (error) {
          console.error("Error updating account:", error);
          return resolve({
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" }),
          });
        }
      });
    });
  } else if (contentType.includes("application/json")) {
    const { username, password, newUsername, newEmail, newPassword } = JSON.parse(event.body);

    if (!username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Username is required" }),
      };
    }

    try {
      const client = new MongoClient(mongoURI);
      await client.connect();
      const db = client.db("web");
      const usersCollection = db.collection("users");

      const user = await usersCollection.findOne({ username });
      if (!user) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: "User not found" }),
        };
      }

      if (password && !(await bcrypt.compare(password, user.password))) {
        return {
          statusCode: 401,
          body: JSON.stringify({ error: "Invalid password" }),
        };
      }

      const updates = {};
      if (newUsername) {
        const usernameExists = await usersCollection.findOne({ username: newUsername });
        if (usernameExists) {
          return {
            statusCode: 409,
            body: JSON.stringify({ error: "Username already exists" }),
          };
        }
        updates.username = newUsername;
      }
      if (newEmail) {
        const emailExists = await usersCollection.findOne({ email: newEmail });
        if (emailExists) {
          return {
            statusCode: 409,
            body: JSON.stringify({ error: "Email already exists" }),
          };
        }
        updates.email = newEmail;
      }
      if (newPassword) {
        updates.password = await bcrypt.hash(newPassword, 10);
      }

      const updateResult = await usersCollection.updateOne({ username }, { $set: updates });
      await client.close();

      if (updateResult.modifiedCount > 0) {
        return {
          statusCode: 200,
          body: JSON.stringify({ message: "Account updated successfully" }),
        };
      } else {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "No changes were made" }),
        };
      }
    } catch (error) {
      console.error("Error updating account:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Internal server error" }),
      };
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid Content-Type header" }),
    };
  }
};

async function handleUpdateAccount(username, password, newUsername, newEmail, newPassword, avatarFile) {
  if (!username) {
    console.error("Username is missing in the request.");
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Username is required" }),
    };
  }

  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db("web");
    const usersCollection = db.collection("users");

    console.log(`Searching for user with username: ${username}`);
    const user = await usersCollection.findOne({ username });

    if (!user) {
      console.error(`User not found for username: ${username}`);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    if (password && !(await bcrypt.compare(password, user.password))) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid password" }),
      };
    }

    // Prepare updates
    const updates = {};
    if (newUsername) {
      const usernameExists = await usersCollection.findOne({ username: newUsername });
      if (usernameExists) {
        return {
          statusCode: 409,
          body: JSON.stringify({ error: "Username already exists" }),
        };
      }
      updates.username = newUsername;
    }
    if (newEmail) {
      const emailExists = await usersCollection.findOne({ email: newEmail });
      if (emailExists) {
        return {
          statusCode: 409,
          body: JSON.stringify({ error: "Email already exists" }),
        };
      }
      updates.email = newEmail;
    }
    if (newPassword) updates.password = await bcrypt.hash(newPassword, 10);

    // Update the user document
    const updateResult = await usersCollection.updateOne(
      { username },
      { $set: updates }
    );

    if (updateResult.modifiedCount > 0) {
      console.log(`User document updated successfully for username: ${username}`);
    } else {
      console.error(`Failed to update user document for username: ${username}`);
    }

    await client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Account updated successfully" }),
    };
  } catch (error) {
    console.error("Error updating account:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}
