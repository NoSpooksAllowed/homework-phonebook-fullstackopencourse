require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

const app = express();

morgan.token("req-body", req => JSON.stringify(req.body));

app.use(cors());
app.use(express.static("static"));
app.use(express.json());
app.use(morgan("combined", { stream: { write: msg => console.log(msg) } }));

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.get("/", (request, response) => {
  response.send("Hello world");
});

app.get("/api/persons", async (request, response) => {
  const persons = await Person.find({});

  response.json(persons);
});

app.get("/api/persons/:id", async (request, response, next) => {
  try {
    const person = await Person.findById(request.params.id);

    if (person) {
      response.json(person);
    } else {
      response.status(404).json({
        error: "not found",
      });
    }
  } catch (err) {
    next(err);
  }
});

app.post("/api/persons", async (request, response, next) => {
  try {
    const body = request.body;

    const foundPerson = await Person.findOne({ name: body.name });

    if (foundPerson) {
      return response.status(400).json({
        error: "name must be unique",
      });
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    });

    const savedPerson = await person.save();

    response.json(savedPerson);
  } catch (err) {
    next(err);
  }
});

app.put("/api/persons/:id", async (request, response, next) => {
  try {
    const body = request.body;

    const person = {
      name: body.name,
      number: body.number,
    };

    const updatedPerson = await Person.findByIdAndUpdate(request.params.id, person, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!updatedPerson) {
      return response.status(404).json({
        error: "not found",
      });
    }

    response.json(updatedPerson);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/persons/:id", async (request, response, next) => {
  try {
    const deletedPerson = await Person.findByIdAndDelete(request.params.id);

    if (!deletedPerson) {
      return response.status(404).json({ error: "Note not found" });
    }
    response.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.get("/info", async (request, response, next) => {
  try {
    const persons = await Person.find({});
    const phonebookLen = `<p>Phonebook has info for ${persons.length} people</p>`;
    const dateTime = new Date();
    const currentDateTime = `<p>${dateTime.toLocaleString()}</p>`;

    response.send(phonebookLen.concat(currentDateTime));
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
});
