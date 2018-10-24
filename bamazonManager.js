var inquirer = require("inquirer");
var mysql = require("mysql");
const cTable = require("console.table");
var colors = require("colors");
var figlet = require("figlet");

var connection = mysql.createConnection ({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root",
    database: "bamazon"
});

// connection.connect(function(err){
//     if(err) throw err;
//   start();
// });

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

    inquirer.prompt([
	{
      name: "option",
      type: "list",
      message: "Please select an option below:\n".red,
      choices: [">>> View Products for Sale", ">>> View Low Inventory", ">>> Add to Inventory", ">>> Add New Product"],
      filter: function (value) {
          if (value === ">>> View Products for Sale") {
          return "sale"      
        } else if (value === ">>> View Low Inventory") {
          return "low"
        } else if (value === ">>> Add to Inventory") {
          return "add"
        } else if (value === ">>> Add New Product") {
          return "new"
        }
      }
    }
    ]).then(function(input) {
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
        connection.end();
    })
};

function displayLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 15", function(err, res) {
        if (err) throw err;

        console.log("\nItems with less then 15 items in stock.\n")

        console.table(res)
        connection.end();
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
        console.log("-------------------------------------------------------------------------------------".blue);
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
    inquirer.prompt([
    {
        name: "product_name",
        type: "input",
        message: "Enter the name of the product you want to add"
    },

    {
        name: "department_name",
        type: "input",
        message: "Which department does the product belong to?"
    },
    {
        name: "price",
        type: "input",
        message: "What is the price of the item you want to add?"
    },
    {
        name: "stock_quantity",
        type: "input",
        message: "What is the quantity you want to add to inventory?"
    }
]).then(function(input) {
    var item = input.product;
    // var addQuantity = parseInt(input.quantity);
    // var price = parseInt(input.price);
    // var dept = input.department;
    var queryStr = ("INSERT INTO products SET ?");

    connection.query(queryStr, input, function(err, res, fields) {
        if (err) throw err;

        console.log(colors.red("Your item has been added."))

        connection.end();
        })
    })
};



