const express = require('express');
const cors = require('cors');
// require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
  res.send('Allah is our khuda')
})

app.listen(port, () => console.log(`Doctors portal running on ${port}`))