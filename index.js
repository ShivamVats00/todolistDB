const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js"); //if package is local or not get installed by npm
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Shivam-Vats:vats6207@cluster0.ck7mge6.mongodb.net/tpdolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(
  console.log("MongoDB Connected with server")
);
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB")


//This is how we create mongoose Schema
const itemsSchema = new mongoose.Schema({
  name: String
});


const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {


  Item.find().then(function(myItems) {

    if (myItems.length === 0) {
      Item.insertMany(defaultItems).then(function() {
        console.log("Sucessfully saved default items to DB.");
      }).catch(function(err) {
        console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: myItems
      });
    }
  });
});


app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
      name: customListName
    })
    .then(function(myItems) {

      if (!myItems) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        console.log("saved");
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: myItems.name,
          newListItems: myItems.items
        });
      }
    })
    .catch(function(err) {});

});


app.post("/", async (req, res) => {
  let itemName = req.body.newItem
  let listName = req.body.list

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save()
    res.redirect("/");
  } else {
    List.findOne({
        name: listName
      })
      .then(function(myItems) {
        myItems.items.push(item);
        myItems.save();
        res.redirect("/" + listName);
      });
  }
});

app.post("/delete", function(req, res){
   const checkedItem = req.body.checkbox;
   const listName = req.body.listName;

  if(listName === "today"){
    Item.deleteOne({_id: checkedItem}).then(function () {
        console.log("Successfully deleted");
        res.redirect("/");
     })
     .catch(function (err) {
        console.log(err);
      });
  }else{
    let doc =  List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItem}}}, {
        new: true
      }).then(function (myItems)
      {
        res.redirect("/" + listName);
      }).catch( err => console.log(err));
  }
})


app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.post("/work", function(req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work")

});

app.listen(3000, function() {
  console.log("The server is running on port 3000");
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('Listening on port ${PORT}');
 });
});
