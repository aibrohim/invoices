// 664
const jsonServer = require("json-server");
const auth = require("json-server-auth");

const app = jsonServer.create();
const router = jsonServer.router("db.json");

const rules = auth.rewriter({
  users: 640,
  invoices: 644,
});

// /!\ Bind the router db to the app
app.db = router.db;

// You must apply the auth middleware before the router
app.use(rules);
app.use(auth);

app.use(router);
app.listen(3001);
