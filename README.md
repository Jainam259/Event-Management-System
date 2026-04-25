# Event-Management-System
Full-stack Event Management System — React, Node.js, Express & MongoDB. JWT auth with Admin & User roles, event CRUD with banner uploads, ticket types (Free/Paid), participant registration, automated email confirmations & cron-based reminders, admin dashboard with analytics & email logs.

🎉 EventManager — Full-Stack Event Management System
A complete Event Management Web Application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).
👤 Authentication & Roles

JWT-based login & signup for Users and Admins
Role-based access control (Admin vs. Participant)
Protected routes on both frontend and backend

📅 Event Features

Create, edit, and manage events with title, description, category, format (In-Person / Virtual), venue, dates, timezone, capacity, and ticket type (Free / Paid)
Banner image upload via Multer
Soft-delete (hide/unhide) events — removes from frontend while preserving data in DB

📝 Registration System

Users can register for events with ticket count
Instant HTML confirmation email sent on registration via Nodemailer
Duplicate registration prevention

📧 Email System

Styled HTML confirmation emails on registration
Automated cron-based reminder emails sent 24 hours before events
Admin can manually trigger reminder jobs
Full Email Log tracking (sent / failed / total) with clear logs option

🛠️ Admin Dashboard

Secure admin login with role verification
Stats overview: Total Users, Events, Registrations, Revenue
Manage all events (hide, unhide, permanently delete)
View all participants & registrations
Analytics charts
Email logs with send/fail stats

🧰 Tech Stack
Layer          Tech
Frontend       React.js, React Router
Backend        Node.js, Express.js 
Database       MongoDB, Mongoose 
Auth           JWT, bcryptjs
Email          Nodemailer, node-cron
File Upload    Multer

<img width="1911" height="969" alt="Screenshot 2026-04-25 103235" src="https://github.com/user-attachments/assets/c9f750b1-360c-4c92-b39f-5719e2c32631" />
<img width="1893" height="966" alt="Screenshot 2026-04-25 103218" src="https://github.com/user-attachments/assets/80f00f47-adc2-4f43-8868-e2257f51ca94" />
<img width="1898" height="967" alt="Screenshot 2026-04-25 103124" src="https://github.com/user-attachments/assets/a059ec8a-d36e-46e9-98a0-e8f068309822" />
<img width="1896" height="949" alt="Screenshot 2026-04-25 103110" src="https://github.com/user-attachments/assets/73d98697-3bd1-4343-9585-9901346590db" />
<img width="1910" height="970" alt="Screenshot 2026-04-25 103038" src="https://github.com/user-attachments/assets/1b9d61ee-0a25-4dc2-8b84-f42f661f2adc" />
<img width="1897" height="963" alt="Screenshot 2026-04-25 102940" src="https://github.com/user-attachments/assets/d59ac33f-ec2a-4b90-b4ff-7c3166b9a908" />
<img width="1893" height="963" alt="Screenshot 2026-04-25 102912" src="https://github.com/user-attachments/assets/d498a27a-45c3-4b38-910b-d3175ed01d3d" />
<img width="1894" height="931" alt="Screenshot 2026-04-25 102849" src="https://github.com/user-attachments/assets/5fc58f6c-cf9a-4fbd-8282-206b1e2f2c35" />
<img width="1905" height="959" alt="Screenshot 2026-04-25 102636" src="https://github.com/user-attachments/assets/13bd44eb-2f14-445c-91a1-c0b496023b85" />
<img width="1895" height="965" alt="Screenshot 2026-04-25 102610" src="https://github.com/user-attachments/assets/b54f20d6-65d8-43af-a8a0-010bc95d0e63" />
<img width="1899" height="941" alt="Screenshot 2026-04-25 102540" src="https://github.com/user-attachments/assets/48f8bbba-6db4-4a81-aead-1bf854c368fa" />
<img width="1905" height="948" alt="Screenshot 2026-04-25 102525" src="https://github.com/user-attachments/assets/43b8e27f-8fd6-4c0d-80b1-d881f860a0ec" />
<img width="1916" height="949" alt="Screenshot 2026-04-25 102457" src="https://github.com/user-attachments/assets/600877b8-e6c4-44aa-8138-f9afa4abaa70" />
<img width="1919" height="949" alt="Screenshot 2026-04-25 102444" src="https://github.com/user-attachments/assets/12a19138-ce1f-4377-b2b2-52a565e42d31" />
<img width="1898" height="957" alt="Screenshot 2026-04-25 103253" src="https://github.com/user-attachments/assets/a4cfb7f5-ed39-49fb-ba3b-7a50f11d4910" />

