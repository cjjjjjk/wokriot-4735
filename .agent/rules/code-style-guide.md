---
trigger: always_on
---

for file under /docs/ only:
- all use Vietnamese

for files under /server/ and /web-frontend/ only:
- wrap all Database and Network operations in a try-except block.
- include Vietnamese comments explaining any complex time-related computation logic.
- generate Flask code using the Application Factory (create_app) pattern or a modular Blueprint structure.

for coding style under /web-frontend/ only
- all comment use Vietnamese

for UI/UX under /web-frontend/ only:
- primary UI style must follow Glassmorphism and Minimalism.
- primary color scheme must use classic orange and warm white tones, avoiding neon or overly saturated colors.