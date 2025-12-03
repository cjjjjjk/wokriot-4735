---
trigger: always_on
---

for file under /docs/ only:
- all use Vietnamese

for files under /server/ only:
- wrap all Database and Network operations in a try-except block.
- include Vietnamese comments explaining any complex time-related computation logic.
- generate Flask code using the Application Factory (create_app) pattern or a modular Blueprint structure.