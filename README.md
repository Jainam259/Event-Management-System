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
Layer          Tech  <br>
Frontend       React.js, React Router  <br>
Backend        Node.js, Express.js 
Database       MongoDB, Mongoose 
Auth           JWT, bcryptjs
Email          Nodemailer, node-cron
File Upload    Multer

<img width="1919" height="949" alt="Screenshot 2026-04-25 102444" src="https://github.com/user-attachments/assets/8fc75a75-b710-400a-aa66-8b14ce2dab03" />
<img width="1916" height="949" alt="Screenshot 2026-04-25 102457" src="https://github.com/user-attachments/assets/5bea2e6e-7792-4aed-a669-e63a2a729fc5" />
<img width="1905" height="948" alt="Screenshot 2026-04-25 102525" src="https://github.com/user-attachments/assets/7a3409d3-f7e4-4018-9728-7a2c8e7037fd" />
<img width="1899" height="941" alt="Screenshot 2026-04-25 102540" src="https://github.com/user-attachments/assets/6b7ac24d-4995-4afa-9f30-6668fa8d147e" />
<img width="1895" height="965" alt="Screenshot 2026-04-25 102610" src="https://github.com/user-attachments/assets/57dc61b8-e1c3-4fac-b802-d6759a2bda5a" />
<img width="1905" height="959" alt="Screenshot 2026-04-25 102636" src="https://github.com/user-attachments/assets/d643748a-4e49-4f61-9d89-e5bdb229e193" />
<img width="1894" height="931" alt="Screenshot 2026-04-25 102849" src="https://github.com/user-attachments/assets/246bb9fd-972f-45bf-8357-0a3c1acc5835" />
<img width="1893" height="963" alt="Screenshot 2026-04-25 102912" src="https://github.com/user-attachments/assets/ec80bdde-c3dd-4f5f-b969-a94c38bc8cc6" />
<img width="1897" height="963" alt="Screenshot 2026-04-25 102940" src="https://github.com/user-attachments/assets/b5864a2a-6dc0-48be-971f-bdb8fe5ac23c" />
<img width="1910" height="970" alt="Screenshot 2026-04-25 103038" src="https://github.com/user-attachments/assets/d8d3245a-b51d-4194-a92e-743e71004813" />
<img width="1896" height="949" alt="Screenshot 2026-04-25 103110" src="https://github.com/user-attachments/assets/a385423c-8167-4898-87eb-7b27056668be" />
<img width="1898" height="967" alt="Screenshot 2026-04-25 103124" src="https://github.com/user-attachments/assets/affae40f-7ec9-449b-8339-65bff314b56a" />
<img width="1893" height="966" alt="Screenshot 2026-04-25 103218" src="https://github.com/user-attachments/assets/01b0407e-1f88-4517-ac1f-a24fd5f131fd" />
<img width="1911" height="969" alt="Screenshot 2026-04-25 103235" src="https://github.com/user-attachments/assets/e42b86db-df09-4434-91f1-cfb6fd64473b" />
<img width="1898" height="957" alt="Screenshot 2026-04-25 103253" src="https://github.com/user-attachments/assets/71b12021-6c48-4060-8614-69a53fa59757" />


