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

app.get("/", (request, response) => {
  response.send("Hello world");
});

app.get("/api/persons", async (request, response) => {
  const persons = await Person.find({});

  response.json(persons);
});

app.get("/api/persons/:id", async (request, response) => {
  try {
    const person = await Person.findById(request.params.id);

    response.json(person);
  } catch (err) {
    console.error(err.message);
    response.status(404).json({
      error: "Not found",
    });
  }
});

app.post("/api/persons", async (request, response) => {
  try {
    const body = request.body;

    if (body.name === undefined || body.number === undefined) {
      return response.status(400).json({
        error: "no name or number field",
      });
    }

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
    console.error(err.message);
    return response.status(500).json({
      error: "Internal server error",
    });
  }
});

app.put("/api/persons/:id", async (request, response) => {
  try {
    const body = request.body;

    if (body.name === undefined || body.number === undefined) {
      return response.status(400).json({
        error: "no name or number field",
      });
    }

    const foundPerson = await Person.findOne({ name: body.name });

    if (foundPerson) {
      foundPerson.number = body.number;

      await foundPerson.save();

      response.json(foundPerson);

      return;
    }

    return response.status(404).json({
      error: "person not found",
    });
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({
      error: "Internal server error",
    });
  }
});

app.delete("/api/persons/:id", async (request, response) => {
  try {
    const deletedPerson = await Person.findByIdAndDelete(request.params.id);

    if (!deletedPerson) {
      return response.status(404).json({ error: "Note not found" });
    }
    response.status(204).end();
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({
      error: "Internal server error",
    });
  }
});

app.get("/info", async (request, response) => {
  try {
    const persons = await Person.find({});
    const phonebookLen = `<p>Phonebook has info for ${persons.length} people</p>`;
    const dateTime = new Date();
    const currentDateTime = `<p>${dateTime.toLocaleString()}</p>`;

    response.send(phonebookLen.concat(currentDateTime));
  } catch (err) {
    console.error(err.message);
    return response.status(500).json({
      error: "Internal server error",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`server running on localhost:${PORT}`);
});
