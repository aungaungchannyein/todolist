//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Chanchan:test123@cluster0.wabwk.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser: true});

const workItems = [];

const itemSchema ={
  name: String
};

const Item =mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todoList!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems =[item1,item2,item3];

const listSchema ={
  name:String,
  items:[itemSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find({},function(err,foundItems){

    if(foundItems.length === 0 ){
      Item.insertMany(defaultItems, function(err){
        if(err){
            console.log(err)
        }else{
        console.log("successfully saved")
        }
      })
      res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  
   
  })

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
      name: itemName
    });
  if(listName === "Today"){
     item.save()
      res.redirect("/")
  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect(""+listName)
    })

  }
 

  });


app.post("/delete", function(req,res){
  var itemId =req.body.checkbox
  var listName = req.body.listName

  if(listName === "Today"){

     Item.deleteOne({ _id: itemId },function(err){
        if(err){
            console.log(err);

        }else{
          console.log("Deleted successfully")
          res.redirect("/")
       }
      });

  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id: itemId}}}, function(err, foundList){
      if(!err){
        res.redirect(""+listName)
      }
    })

  }
 
})

app.get("/:customListName", function(req,res){
 const customListName= _.capitalize(req.params.customListName);

 List.findOne({name:customListName}, function(err, foundList){
  if(!err){
    if(!foundList){
       const list = new List({
          name: customListName,
          items: defaultItems 
        })
        list.save();
        res.redirect("/"+customListName)
    }
    else{
      res.render("list",{listTitle: foundList.name,newListItems: foundList.items})
    }
  }
 })



})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
