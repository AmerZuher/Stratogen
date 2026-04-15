**Start both apps together**

```bash
pm2 start ecosystem.config.js
```

- This will start both backend and frontend processes **detached**, and keep them alive even if VS Code or SSH closes.

---
## **Step 3: Manage them**

- List running apps:
```bash
pm2 list
```

- View logs:
```bash
pm2 logs backend
pm2 logs frontend
```

- Stop both:
```bash
pm2 stop all
```

- Restart both:
```bash
pm2 restart all
```

---

## **Step 4 (optional): Auto-start after reboot**

```bash
pm2 save
pm2 startup
```

- Ensures both backend and frontend start automatically when the server reboots.

---
