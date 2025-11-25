# Task List Application

A simple web application to keep track of your tasks, works well on both smartphones and desktop screen sizes.<br>
Made as a task for recruitment into a well-reputed club in my university.<br>
[Click here](https://tasklistapplication-sjj7.onrender.com/) to view demo app hosted on render.com


# Technologies Used

### Frontend
- Vanilla HTML/CSS
- TypeScript
- Vite for HMR and bundling

### Backend
- TypeScript
- ExpressJS for hosting files and the API
- tsup to bundle server code
- bcrypt to encrypt/decrypt passwords
- PostgreSQL as the database, hosted on render.com

# Project structure
> (...) -> description of the file / directory
```
root/
├── .env.sample (sample .env file)
├── .gitignore
├── dist/ (built files for client)
│   ├── assets/
│   │   ├── index-CDoglT1b.js
│   │   └── ScienceGothic-VariableFont_CTRS,slnt,wdth,wght.ttf
│   ├── credits.md
│   ├── index.css
│   ├── index.html
│   └── libs/
│       └── marked.umd.js
├── dist-server/ (built files for server)
├── html/ (html files for client)
│   ├── credits.html
│   └── index.html
├── package.json
├── public/ (static files)
│   ├── assets/
│   │   └── ScienceGothic-VariableFont_CTRS,slnt,wdth,wght.ttf
│   ├── credits.md
│   ├── index.css
│   └── libs/
│       └── marked.umd.js
├── README.md
├── server/ (main server code)
│   ├── main.ts
│   ├── queries.ts
│   ├── tempAuthTokens.ts
│   └── validator.ts
├── src/ (main client code)
│   ├── api.ts
│   ├── main.ts
│   ├── tasks.ts
│   ├── toast.ts
│   └── vite-env.d.ts
├── tsconfig.json
├── tsconfig.server.json
├── tsup.server.config.ts
└── vite.config.js
```

# Running from source
- Ensure you have NodeJS & npm installed (The NodeJS version used to make this project was v22.17.1)
- Clone this repository and cd into the root folder
- `npm i` to install dependencies
- `npm start` to start vite's dev server and hmr
- `npm run start:server` to start the backend api
- `npm run build` to build both backend and frontend
- `npm run start:server prod` to run the entire application in production

# Credits
Credits can be viewed in [credits.md](./public/credits.md)