const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

morgan.token("req-body", req => JSON.stringify(req.body));

app.use(cors());
app.use(express.json());
app.use(morgan("combined", { stream: { write: msg => console.log(msg) } }));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("Hello world");
});

const getRandomId = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).send(`note with id ${id} not found`);
  }
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({
      error: "no name or number field",
    });
  }
  const foundPerson = persons.find(person => person.name === body.name);

  if (foundPerson) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: getRandomId(persons.length + 1, 100),
  };

  persons = persons.concat(person);

  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
});

app.get("/info", (request, response) => {
  const phonebookLen = `<p>Phonebook has info for ${persons.length} people</p>`;
  const dateTime = new Date();
  const currentDateTime = `<p>${dateTime.toLocaleString()}</p>`;

  response.send(phonebookLen.concat(currentDateTime));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
});
