const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const toDate = require("date-fns/toDate");
const parseIso = require("date-fns/parseISO");
const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const hasStatusProperty = (requestObject) => {
  const my2 = ["TO DO", "IN PROGRESS", "DONE"];
  return my2.includes(requestObject);
};

const hasPriorityProperty = (requestObject) => {
  const my1 = ["HIGH", "LOW", "MEDIUM"];
  return my1.includes(requestObject);
};

const hasCategoryProperty = (requestObject) => {
  const my3 = ["WORK", "HOME", "LEARNING"];
  return my3.includes(requestObject);
};
const camelCase = (requestObject) => {
  return {
    id: requestObject.id,
    todo: requestObject.todo,
    category: requestObject.category,
    priority: requestObject.priority,
    status: requestObject.status,
    dueDate: requestObject.due_date,
  };
};
const hasDateProperty = (requestObject) => {
  return isValid(requestObject);
};
const hasToDoBody = (requestObject) => {
  return requestObject !== undefined;
};
const noStatus = (response) => {
  response.status(400);
  response.send("Invalid Todo Status");
  console.log("2");
};
const noPriority = (response) => {
  response.status(400);
  response.send("Invalid Todo Priority");
  console.log("4");
};
const noCategory = (response) => {
  response.status(400);
  response.send("Invalid Todo Category");
  console.log("9");
};
const noDueDate = (response) => {
  response.status(400);
  response.send("Invalid Due Date");
  console.log("13");
};

app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q = "" } = request.query;
  console.log(request.query);
  console.log(status);
  console.log(priority);
  console.log(category);
  console.log(search_q);
  switch (true) {
    case status !== undefined:
      if (hasStatusProperty(status)) {
        const myQuery1 = `select * from todo where status = '${status}'`;
        const dbResponse = await db.all(myQuery1);
        response.send(dbResponse.map((each) => camelCase(each)));
        console.log("1");
      } else {
        noStatus(response);
      }
      break;
    case priority !== undefined:
      if (hasPriorityProperty(priority)) {
        const myQuery2 = `select * from todo where priority='${priority}'`;
        const dbRest = await db.all(myQuery2);
        response.send(dbRest.map((each) => camelCase(each)));
        console.log("3");
      } else {
        noPriority(response);
      }
      break;
    case priority !== undefined && status !== undefined:
      if (hasPriorityProperty(status) && hasStatusProperty(priority)) {
        const myQuery3 = `select * from todo where status = '${status}' and
                priority = '${priority}'`;
        const dbR = await db.all(myQuery3);
        response.send(dbR.map((each) => camelCase(each)));
        console.log("5");
      }
      break;
    case search_q !== "":
      const myQuery4 = `select * from todo where 
         todo like '%${search_q}%'`;
      const dbZ = await db.all(myQuery4);
      response.send(dbZ.map((each) => camelCase(each)));
      console.log("6");
      break;
    case category !== undefined && status !== undefined:
      if (hasCategoryProperty(category) && hasStatusProperty(status)) {
        const myQuery4 = `select * from todo where category = '${category}'
            and status = '${status}' ;`;
        const dbS = await db.all(myQuery4);
        response.send(dbS.map((each) => camelCase(each)));
        console.log("7");
      }
      break;
    case category !== undefined:
      if (hasCategoryProperty(category)) {
        const myQuery5 = `select * from todo where category = '${category}';`;
        const dbF = await db.all(myQuery5);
        response.send(dbF.map((each) => camelCase(each)));
        console.log("8");
      } else {
        noCategory(response);
      }
      break;
    case category !== undefined && priority !== undefined:
      if (hasCategoryProperty(category) && hasPriorityProperty(priority)) {
        const myQuery6 = `select * from todo where category = '${category}'
            and priority='${priority}';`;
        const dbP = await db.all(myQuery6);
        response.send(dbF.map((each) => camelCase(each)));
        console.log("10");
      }
      break;
    default:
      console.log("cheezBadi hain mast");
      break;
  }
});
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const myQuery = ` select * from todo where id = ${todoId}`;
  const requestObject = await db.get(myQuery);
  const todoObject = {
    id: requestObject.id,
    todo: requestObject.todo,
    category: requestObject.category,
    priority: requestObject.priority,
    status: requestObject.status,
    dueDate: requestObject.due_date,
  };
  response.send(todoObject);
  console.log("11");
});
app.get("/agenda/", async (request, response) => {
  console.log("helloWorld");
  const { date } = request.query;
  console.log(typeof date);
  console.log(date);
  const a = parseIso(date);
  if (hasDateProperty(a)) {
    const ab = format(a, "yyyy-MM-dd");
    console.log(ab);
    const myQuery7 = `select * from todo where due_date = "${ab}"`;
    const requestObject = await db.all(myQuery7);
    response.send(requestObject.map((each) => camelCase(each)));
    console.log("12");
  } else {
    noDueDate(response);
  }
});

app.post("/todos/", async (request, response) => {
  const todoB = request.body;
  const { id, todo, category, status, priority, dueDate } = todoB;
  console.log(todoB);
  let a = "";
  if (dueDate !== undefined) {
    a = parseIso(dueDate);
  }
  if (
    hasStatusProperty(status) &&
    hasCategoryProperty(category) &&
    hasDateProperty(a) &&
    hasToDoBody(todo) &&
    hasPriorityProperty(priority)
  ) {
    const myQuery89 = `insert into todo(id,todo,priority,status,category,due_date)
            values(${id},'${todo}','${priority}','${status}','${category}','${dueDate}')`;
    await db.run(myQuery89);
    response.send("Todo Successfully Added");
    console.log("21");
  } else {
    if (!hasStatusProperty(status)) {
      noStatus(response);
    } else if (!hasCategoryProperty(category)) {
      noCategory(response);
    } else if (!hasPriorityProperty(priority)) {
      noPriority(response);
    } else if (!hasDateProperty(a)) {
      noDueDate(response);
    }
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const todoBody = request.body;
  const { todoId } = request.params;
  console.log(todoId);
  console.log(todoBody);
  const { category, todo, priority, status, dueDate } = todoBody;
  console.log(status);
  console.log(todo);
  console.log(priority);
  console.log(dueDate);
  console.log(category);
  let a = "";
  if (dueDate !== undefined) {
    a = parseIso(dueDate);
  }
  switch (true) {
    case status !== undefined:
      if (hasStatusProperty(status)) {
        const myQuery11 = ` update todo 
          set status = '${status}' where id= ${todoId}`;
        await db.run(myQuery11);
        response.send("Status Updated");
        console.log("09");
      } else {
        noStatus(response);
      }
      break;
    case priority !== undefined:
      if (hasPriorityProperty(priority)) {
        const myQuery21 = `update todo 
            set priority = '${priority}' 
            where id= ${todoId}`;
        await db.run(myQuery21);
        response.send("Priority Updated");
        console.log("10");
      } else {
        noPriority(response);
      }
      break;
    case hasToDoBody(todo):
      const myQuery31 = `update todo 
            set todo ='${todo}' where id=${todoId}`;
      await db.run(myQuery31);
      response.send("Todo Updated");
      console.log("23");
      break;
    case category !== undefined:
      if (hasCategoryProperty(category)) {
        const myQuery41 = `update todo 
                    set category = '${category}' where id=${todoId}`;
        await db.run(myQuery41);
        response.send("Category Updated");
        console.log("41");
      } else {
        noCategory(response);
      }
      break;
    case dueDate !== undefined:
      if (hasDateProperty(a)) {
        const abc = format(a, "yyyy-MM-dd");
        console.log(abc);
        const myQuery71 = ` update todo set due_date = "${abc}"
                where id = ${todoId}`;
        await db.run(myQuery71);
        response.send("Due Date Updated");
        console.log("90");
      } else {
        noDueDate(response);
      }
      break;
    default:
      console.log("pakkakelli aaduko");
      break;
  }
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const myQuery = ` delete from todo where id = ${todoId}`;
  await db.run(myQuery);
  response.send("Todo Deleted");
  console.log("36");
});

module.exports = app;
