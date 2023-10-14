const mongoose = require("mongoose");

const main = async () => {
  if (process.argv.length < 3) {
    console.log("give password as argument");
    process.exit(1);
  }

  const password = process.argv[2];

  const url = `mongodb+srv://spook11:${password}@phonebook-notes-db.vx96f28.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

  mongoose.set("strictQuery", false);
  mongoose.connect(url);

  const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  });

  const Person = mongoose.model("Person", personSchema);

  if (process.argv.length === 3) {
    const result = await Person.find({});

    result.forEach(person => {
      console.log(person);
    });
  } else {
    if (process.argv[3] === undefined || process.argv[4] === undefined) {
      console.log("give name and number");
      process.exit(1);
    }

    const person = new Person({
      name: process.argv[3],
      number: process.argv[4],
    });

    const result = await person.save();

    if (result) {
      console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`);
    }
  }

  mongoose.connection.close();
};

if (require.main === module) {
  (async () => {
    await main();
  })();
}
