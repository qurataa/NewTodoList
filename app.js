const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb+srv://kyuracode:legowoojokendor@firstcluster.nn4cdj8.mongodb.net/todoDB", { useNewUrlParser: true });

const app = express();

const todoSchema = new mongoose.Schema({
  checked: Boolean,
  todo: String,
});

const todoModel = mongoose.model("Todo", todoSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [todoSchema],
});

const listModel = mongoose.model("items", listSchema);

const item1 = new todoModel({
  checked: false,
  todo: "test",
});

const item2 = new todoModel({
  checked: false,
  todo: "cobaaa",
});

defaultItems = [item1, item2];
const day = date.getDate();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {

  todoModel.find(function (err, todoItem) {
    if (err) {
      console.log(err);
    } else {
      res.render("list", { newTitle: day, newListItem: todoItem });
    }
  });
});

app.get("/:newCustomLists", (req, res) => {
  const customList = _.capitalize(req.params.newCustomLists);

  listModel.findOne({ name: customList }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const itemList = new listModel({
          name: customList,
          items: [],
        });
        itemList.save();
        res.redirect(`/${customList}`);
      } else {
        res.render("list", { newTitle: customList, newListItem: foundList.items });
      }
    }
  });
});


app.post("/delete", (req, res) => {
  const checkedItem = req.body.checkboxBtn;
  const listTitle = req.body.listName;
  
  if(listTitle === day){
    todoModel.findByIdAndDelete(checkedItem, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Succeed delete item");
        res.redirect("/");
      }
    });

  }else{
    listModel.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: checkedItem}}}, function(err,foundList){
      if(!err){
        res.redirect(`/${listTitle}`);
      }
    });
  }
 
});

app.post("/", (req, res) => {
  const item = req.body.newItem;
  const customList = req.body.list;
  const hari = day.slice(0, day.indexOf(' '));
  const itemTodo = new todoModel({
    checked: false,
    todo: item,
  });

  if (customList === hari) {
    itemTodo.save();
    res.redirect("/");
  } else {
    listModel.findOne({ name: customList }, function (err, foundList) {
      foundList.items.push(itemTodo);
      foundList.save();
      res.redirect(`/${customList}`);
    });
  }
});


app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started on port 3000");
});
