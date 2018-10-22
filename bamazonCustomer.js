var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table');
var itemID = 0;
var itemQuantity = 0;
var selected;
var statement;
var colors = require("colors");
var figlet = require('figlet');



//create the connection info for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  //port if not 3306
  port: 3307,

  //username
  user: "root",

  //password
  password: "root",
  database: "bamazon"
});

//connect to the mysql server and sql database
connection.connect(function(err) {
  if(err) throw err;
  //run start function after connection is made 
//   start();
  // console.log("connected as: " + connection.threadId);
  console.log('\033[2J');
  console.log(colors.rainbow("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-"));
  figlet('Bamazon', function(err, data) {
    if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return;
    }
    console.log(data)
    start();

});

})

function start() {

 
  // console.log(colors.rainbow("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-"));
  // console.log("\n" +"WELCOME TO BAMAZON" + "\n");
  console.log(colors.rainbow("*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-\n"));
  inquirer.prompt ({
    name: "browse",
    type: "confirm",
    message: "Would you like to browse available products?".blue
  }
  ).then(function(answer) {
    if(answer.browse) {
      showItems();

    } else {
      connection.end();
    }
  })
}

function showItems() {
 
  connection.query("SELECT item_id, product_name, department_name, price FROM products", function(err, res) {

    // for (var i = 0; i < res.length; i++) {
      console.log("-------------------------------------------------------------------------------------".blue);
      // console.table(res)
      console.table(res);
      // console.table("Item: " + res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price);

    // }

    console.log("-------------------------------------------------------------------------------------".blue);
    placeOrder();
  });
}
 
    function placeOrder() {
      inquirer.prompt ([
      {
        name: "id",
        message: "\nPlease enter the ID of the item you want to purchase".blue,
        type: "input",
        validate: function(value) {
          if (value <=0 || isNaN(value)) {
            console.log("\nPlease enter a valid ID");
          } else {
            return true;
          }
        }

      },
      {
        name: "quantity",
        message: "Enter the quantity you would like to purchase?".blue,
        type: "input",
        validate: function(value) {
          if (isNaN(value)) {
            console.log("\nPlease enter a valid quantity.");
          } else {
            return true;
          }
        }
      }
    ]).then(function(answer) {
        itemID = answer.id;
        itemQuantity = answer.quantity;

        connection.query("SELECT * FROM products WHERE item_id=" + itemID, function (err, res) {
        selected = res[0];

        if (itemQuantity > selected.stock_quantity && selected.stock_quantity > 1) {
        statement = "\nSorry, we only have " + selected.stock_quantity + " " + selected.product_name + " available.\n".red;
        console.log(colors.red(statement));
        placeOrder();

      } else {

        var query = connection.query(
          "UPDATE products SET stock_quantity=stock_quantity - ? WHERE item_id=?", [itemQuantity, itemID], function(err, res) {
      
          if (err) throw err; 
          console.log(colors.yellow("\nYour order has been placed\n"));

          console.log(colors.green(">>>> Your total is $" + selected.price * itemQuantity + "\n"));
          inquirer.prompt ({
            name: "browse",
            type: "confirm",
            message: "Would you like to place another order?".blue
          }
          ).then(function(answer) {
            if(answer.browse) {
              showItems();
        
            } else {
              connection.end();
            }
          })

        })
      }
    })
  })

};