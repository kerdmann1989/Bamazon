var inquirer = require("inquirer");
var mysql = require("mysql");
const cTable = require("console.table");
var colors = require("colors");


var connection = mysql.createConnection ({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function(err){
    if(err) throw err;
  start();
});


function start() {

    inquirer.prompt([
	{
      name: "option",
      type: "list",
      message: "Select an option",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
      filter: function (value) {
          if (value === "View Products for Sale") {
          return "sale"      
        } else if (value === "View Low Inventory") {
          return "low"
        } else if (value === "Add to Inventory") {
          return "add"
        } else if (value === "Add New Product") {
          return "new"
        }
      }
  }
]).then(function(input) {
    // console.log('User has selected: ' + JSON.stringify(input));

    // Trigger the appropriate action based on the user input
    if (input.option === "sale") {
        displayInventory();
    } else if (input.option === "low") {
        displayLowInventory();
    } else if (input.option === "add") {
        addToInventory();
    } else if (input.option === "new") {
        addNewProduct();
    }
  })
}

function displayInventory() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        console.table(res);
    })
};

function displayLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        if (err) throw err;

        console.log("\nItems with less then 5 items in stock.\n")

        console.table(res)
        })
    };

function addToInventory() {

    inquirer.prompt(
        {
          name: "inventory",
          type: "confirm",
          message: "Would you like to view current inventory?"
           
        },
      ).then(function(answer) {
        if(answer.inventory) {
        showInventory();
        
        } else {
            connection.end();
        }
      })

      function showInventory() {
          
        connection.query("SELECT * FROM products", function(err, res) {

            // for (var i = 0; i < res.length; i++) {
            console.log("-------------------------------------------------------------------------------------".blue);
            // console.table(res)
            console.table(res);
        
            console.log("-------------------------------------------------------------------------------------".blue);
        
            updateInventory(); 
        });    
      }

    function updateInventory() {
    inquirer.prompt([
        {
          name: "item_id",
          type: "input",
          message: "Please enter the Item ID for the item you would to add inventory "
           
        },
        {
           name: "quantity",
           type: "input",
           message: "How many would you like to add?"

        }
    ]).then(function(input) {
        var item = input.item_id;
        var addQuantity = parseInt(input.quantity);
        // console.log('User has selected: ' + JSON.stringify(input));
        var queryStr = ("SELECT * FROM products WHERE ?");

        connection.query(queryStr, {item_id: item}, function(err, res) {
            if (err) throw err;
            if (res.length === 0) {
                console.log("Error: Invalid Item ID")
                addToInventory();
            } else {
                var productData = res[0];
				var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity + addQuantity) + ' WHERE item_id = ' + item;
                connection.query(updateQueryStr, function (err, res) {
                    if (err) throw err;
                    console.log(colors.red("Stock count for Item ID " + item + " has been updated to " + (productData.stock_quantity + addQuantity)));
                    connection.end();
                })
			}
		})
	})
}
}

function addNewProduct() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        console.table(res);
    })
};



