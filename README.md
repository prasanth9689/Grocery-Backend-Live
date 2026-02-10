# Modules Folder (Feature-Based)
Each feature has:
- model
- controller
- service
- routes

This makes it:
- Easy to scale
- Easy to maintain
- Perfect for microservices later

Service Layer Pattern <br>
Controller → Service → Database <br>
Example:
```
Controller = request/response
Service = business logic
Model = DB interaction
```
This keeps controllers clean. <br>
Add These for Production
```
├── jobs/              (cron jobs)
├── sockets/           (real-time delivery tracking)
├── integrations/      (Razorpay, Stripe, SMS, Firebase)
├── docs/              (Swagger API docs)
```

Grocery-Backend-NodeJs-Grocery-Build-Script-Create-Tenant
https://github.com/prasanth9689/Grocery-Backend-NodeJs-Grocery-Build-Script-Create-Tenant

Grocery-Backend-Live
https://github.com/prasanth9689/Grocery-Backend-Live

Testing flow <br>
##  Register <br>
POST<br>
Body (JSON):

```
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin"
}
```
##  Login <br>
POST
```
/api/auth/login
```
Response:
```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Access Protected Route <br>
Header:
```
Authorization: Bearer YOUR_TOKEN
```
## Security Notes (Important for SaaS)
1, Always validate tenant inside JWT (already done). <br>
2, Never trust frontend role. <br>
3, Use HTTPS only. <br>
4, Do not expose DB root user in production — use restricted DB user.

## Proper Production JWT Secret
You need a long, high-entropy random string (at least 256-bit).

Generate securely on your server:

Option 1 – Linux / Ubuntu (recommended)
```
openssl rand -hex 32
```
Example output:
```
9f3c8a2d7e4b91c6f0a8d1e3b4c7f9a2d8e6c4b1f0a9d3e7c2b6f1a8d4e9c7
```
Use that in .env:
```
JWT_SECRET=9f3c8a2d7e4b91c6f0a8d1e3b4c7f9a2d8e6c4b1f0a9d3e7c2b6f1a8d4e9c7
JWT_EXPIRES=1d
```
## Login
Body (json)
```
{
  "email": "admin@test.com",
  "password": "123456"
}
```
Response
```
{
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsInJvbGUiOiJhZG1pbiIsInRlbmFudCI6InRlc3QyIiwiaWF0IjoxNzcwNzEzNTkwLCJleHAiOjE3NzEzMTgzOTB9.kbyrCQbkhvuwiUq12whB-Q4M_qTJSIOQ4Ch8nYqUlyE"
}
```
## Test Order API
Create Order
```
POST https://test.skyblue.co.in/api/orders
Authorization: Bearer <token>
Content-Type: application/json
```
Body:
```
{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ]
}
```
Architecture Notes (Important for SaaS) <br>
This implementation:
- Uses tenant DB via req.db
- Uses transaction (ACID safe)
- Deducts stock safely
- Secured by JWT
- User isolation per tenant
This is production-grade pattern used in SaaS systems.

## pm2
pm2 show list
```
pm2 list
```
For restart all
```
pm2 restart all
```

For log
```
 pm2 logs grocery-saas
```

