const express = require("express");
const bp = require('body-parser')
const cors = require("cors")
const gameRoute = require("./routes/game");
const PORT = process.env.PORT || 3001;
const app = express();

const corsOptions = ({
  origin: "http://solanadarts.fun"
})

app.use(
  cors()
);



app.options('/*', (_, res) => {
  res.sendStatus(200);
});

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))


app.use("/api/game", gameRoute);



// app.post("/txstatus", async (req, res) => {
//   //res.json({a, b, sigStatus})
// })

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});