//
// MongoDB Database Initialization Script for Tic Tac Toe
// This script creates collections: users, games, leaderboards
// with validation schemas and recommended indexes.
//

/**
 * PUBLIC_INTERFACE
 * Main function to initialize MongoDB schema for Tic Tac Toe.
 * 
 * Usage: Run with mongosh
 *   mongosh "mongodb://<user>:<pass>@<host>:<port>/<db>?authSource=admin" init_schema.js
 */
async function initializeSchema(db) {
  // USERS Collection
  await db.createCollection('users', {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["username", "email", "password_hash", "created_at"],
        properties: {
          username: { bsonType: "string", description: "Unique user handle" },
          email: { bsonType: "string", description: "User email", pattern: "^.+@.+\\..+$"},
          password_hash: { bsonType: "string", description: "Password hash" },
          profile: {
            bsonType: "object",
            description: "Profile info",
            properties: {
              avatar: { bsonType: ["string", "null"], description: "URL to avatar" }
            },
            required: []
          },
          created_at: { bsonType: "date", description: "Account creation timestamp" },
          last_login: { bsonType: ["date", "null"], description: "Last login timestamp" }
        }
      }
    }
  });
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  // GAMES Collection
  await db.createCollection('games', {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["players", "moves", "status", "created_at"],
        properties: {
          players: {
            bsonType: "array",
            description: "Array of two player IDs",
            minItems: 2, maxItems: 2,
            items: { bsonType: "objectId" }
          },
          moves: {
            bsonType: "array",
            description: "Moves with player and position",
            items: {
              bsonType: "object",
              required: ["player", "position", "timestamp"],
              properties: {
                player: { bsonType: "objectId", description: "User ID" },
                position: { 
                  bsonType: "object",
                  required: ["row", "col"],
                  properties: {
                    row: { bsonType: "int", minimum: 0, maximum: 2 },
                    col: { bsonType: "int", minimum: 0, maximum: 2 }
                  }
                },
                timestamp: { bsonType: "date" }
              }
            }
          },
          status: {
            bsonType: "string",
            enum: ["ongoing", "win", "draw", "abandoned"],
            description: "Game status"
          },
          winner: { bsonType: ["objectId", "null"], description: "Winner ID or null" },
          created_at: { bsonType: "date" },
          completed_at: { bsonType: ["date", "null"] }
        }
      }
    }
  });
  await db.collection('games').createIndex({ "players": 1 });
  await db.collection('games').createIndex({ "status": 1, "created_at": -1 });

  // LEADERBOARDS Collection
  await db.createCollection('leaderboards', {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["user_id", "games_played", "games_won", "games_drawn", "games_lost", "win_rate", "ranking"],
        properties: {
          user_id: { bsonType: "objectId", description: "Reference to user" },
          games_played: { bsonType: "int", minimum: 0 },
          games_won: { bsonType: "int", minimum: 0 },
          games_drawn: { bsonType: "int", minimum: 0 },
          games_lost: { bsonType: "int", minimum: 0 },
          win_rate: { bsonType: "double", minimum: 0.0, maximum: 1.0 },
          ranking: { bsonType: "int", minimum: 1 }
        }
      }
    }
  });
  await db.collection('leaderboards').createIndex({ ranking: 1 }, { unique: true });
  await db.collection('leaderboards').createIndex({ user_id: 1 }, { unique: true });

  print("Tic Tac Toe DB schema initialized successfully.");
}

if (typeof db !== 'undefined') {
  // For direct execution in mongosh shell
  initializeSchema(db);
}
