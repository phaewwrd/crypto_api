#Step of run Project

```bash
git clone https://github.com/phaewwrd/crypto_api.git
```
```bash
cd crypto_api
npm install
```
#Create .env file
```js
DATABASE_URL="mysql://root:your_password@localhost:3306/crypto_db"
JWT_SECRET="xxxxx"
```
# Connect with Database
```bash
npx prisma db push
npm run seed
```
# Start Project
```bash
npm run dev
```
