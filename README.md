# Social Network

A full-stack social media application where users can create posts, follow each other, join groups, chat in real-time, and organize events.

## What's Inside

- **Backend**: Built with Go, uses SQLite for the database
- **Frontend**: Built with Next.js and React
- **Real-time features**: WebSocket support for instant messaging and notifications

## What You Need

Before you start, make sure you have these installed on your computer:

- [Docker](https://www.docker.com/products/docker-desktop) (includes Docker Compose)

That's it! Docker handles everything else.

## How to Run

1. **Open your terminal** and go to the project folder:

    ```bash
    cd social-network
    ```

2. **Start the application**:

    ```bash
    docker-compose up
    ```

    The first time you run this, it might take a few minutes because Docker needs to download and build everything. Subsequent runs will be much faster.

3. **Open your browser** and go to:
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:8080

That's it! The app should now be running.

## Stopping the Application

When you're done, press `Ctrl + C` in the terminal where Docker is running.

If you want to stop and remove everything:

```bash
docker-compose down
```

## Troubleshooting

**Port already in use?**  
If you see an error about ports 3000 or 8080 being in use, you'll need to stop whatever is using those ports first.

**Something not working?**  
Try rebuilding everything from scratch:

```bash
docker-compose down
docker-compose up --build
```

## Project Structure

```
├── backend/           # Go backend code
├── frontend/          # Next.js frontend code
├── docker-compose.yml # Docker configuration
└── main.go           # Backend entry point
```

## Features

- User authentication (sign up, sign in, sign out)
- Create and share posts with different privacy settings
- Comment on posts
- Follow/unfollow other users
- Create and join groups
- Group posts and discussions
- Real-time private messaging
- Real-time group chat
- Create and manage events
- Notifications for interactions
- User profiles

---

Need help? Check the code or reach out to the team!
