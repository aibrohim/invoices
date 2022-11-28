// 664
const jsonServer = require("json-server");
const auth = require("json-server-auth");
const yup = require("yup");
const middlewares = jsonServer.defaults({ noCors: false });

const app = jsonServer.create();

const router = jsonServer.router("db.json");

const rules = auth.rewriter({
  users: 640,
  invoices: 644,
});

// /!\ Bind the router db to the app
app.db = router.db;
app.use(middlewares);
// You must apply the auth middleware before the router
app.use(rules);
const invoiceValidationScheme = yup.object().shape({
  to: yup
    .string()
    .required("Client name (to) should be provided")
    .typeError("Client name (to) should be string")
    .min(3, "Min client name length is 3")
    .max(50, "Max client name length is 50"),
  email: yup
    .string()
    .required("Email is required")
    .typeError("Email should be in string format")
    .email("Email should be correctly provided"),
  dueDate: yup
    .date()
    .required("Date is required")
    .typeError("Date should be in date format"),
  description: yup
    .string()
    .notRequired()
    .typeError("Description must be in string format"),
  paid: yup
    .boolean()
    .required("Paid field is required!")
    .typeError("Paid should be boolean"),
  price: yup
    .number()
    .required("Price is required!")
    .typeError("Price should be number!")
    .min(100, "Min price is 100!")
    .max(1000, "Max price is 1000!"),
  term: yup
    .number()
    .required("Term should be selected!")
    .typeError("Term should be number!")
    .oneOf([1, 7, 14, 30], "Term should be one of 1, 7, 14 or 30"),
});

app.use(jsonServer.bodyParser);
app.use(async (req, res, next) => {
  console.log(req.path);
  if (
    req.path.startsWith("/644/invoices") &&
    (req.method === "POST" || req.method === "PUT")
  ) {
    try {
      req.body.createdDate = new Date().toISOString();
      req.body.paid = req.body.paid ?? false;
      await invoiceValidationScheme.validate(req.body);
      return next();
    } catch (error) {
      return res.status(400).json({ type: error.name, message: error.message });
    }
  }
  next();
});
app.use(auth);

app.use(router);
app.listen(3001);
