
# 🍛 Biriyani Rating Web App

This is a full-stack web application that allows users to rate and review biriyani from various local hotels. It was built as part of a mini project to explore backend development, database design, and real-world web app functionality.

---

## 🚀 Features

- ⭐ Rate biriyani from listed hotels (1 to 5 stars)
- 👤 User email verification with code expiry
- 🔐 One rating per hotel per day per user (enforced by DB constraint)
- 🗃️ Backend built using Node.js, Express, and MySQL
- 🧠 Normalized relational database schema with foreign keys and checks

---

## 🏗️ Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL (with schema file)
- **Version Control**: Git & GitHub

---

## 🗄 Database Schema

The SQL file containing table definitions is available in:

```
/db/schema.sql
```

To set up the schema:

1. Open MySQL Workbench
2. Create a new database (e.g., `rateforu`)
3. Run the contents of `schema.sql` inside it

---

## ⚙️ How to Run Locally

1. Clone this repository
2. Run `npm install` to install dependencies
3. Create a `.env` file based on the `.env.example` template

Example `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=rateforu
```

4. Start the server:
```bash
node server.js
```

---

## 📁 Project Structure

```
rateforu/
├── public/               # Frontend files
├── db/
│   └── schema.sql        # Database schema
├── .env.example
├── server.js             # Backend logic
├── package.json
└── README.md             # You're reading it!
```

---

## 📝 Future Improvements

- 🌐 Host frontend and backend on live server
- 🔐 Add login/signup with Firebase Auth
- 🖼️ Hotel image upload via Firebase Storage
- 🔍 Search and filter hotels by location
- 📊 Admin panel for hotel stats and feedback

---

## 🙋‍♂️ Author

**Mohammed Fayiz T**  
[GitHub](https://github.com/MOHAMMEDFAYIZT)  
[LinkedIn](https://linkedin.com/in/mohammed-fayiz-t-7aab55259)

---

## 📜 License

This project is for educational/demo purposes only.
